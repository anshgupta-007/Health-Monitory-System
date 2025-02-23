import { useState, useEffect, useRef, RefObject } from 'react';
import { MessageCircle, X, Send, Mic, Loader2, StopCircle, AlertTriangle } from 'lucide-react';
import Groq from 'groq-sdk';
import toast from 'react-hot-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isEmergency?: boolean;
  sources?: string[];
}

const GROQ_API_KEY = "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";
const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });

const medicalAgentTemplates: Record<string, string> = {
  diagnosis: `You are a medical assistant analyzing symptoms. Provide:
1. Possible conditions (list max 3)
2. Urgency level (emergency/urgent/routine)
3. Next steps
4. Always recommend doctor consultation
Never diagnose. Use markdown. Highlight emergencies in **bold**. Cite CDC/WHO guidelines.`,
  
  treatment: `You are a treatment information specialist. Provide:
1. Evidence-based treatments
2. Medication info (generic names only)
3. Side effects
4. Alternatives
Always add "Consult your doctor before taking any medication."`,
  
  prevention: `You are a preventive care expert. Provide:
1. Prevention strategies
2. Lifestyle modifications
3. Screening recommendations
4. Risk factors
Base advice on CDC/WHO guidelines. Use bullet points.`
};

const routerPrompt = `Classify medical query into:
1. diagnosis - symptom analysis
2. treatment - medication/therapy info
3. prevention - preventive measures

Respond ONLY with the category name.`;

const HealthcareChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your health assistant. I cannot diagnose - always consult a doctor. How can I help?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef: RefObject<HTMLDivElement> = useRef(null);
  const mediaRecorderRef: RefObject<MediaRecorder | null> = useRef(null);
  const chunksRef = useRef<Blob[]>([]);

  const emergencyKeywords = new Set<string>([
    'chest pain', 'shortness of breath', 'severe bleeding',
    'cannot breathe', 'passed out', 'loss of consciousness',
    'sudden numbness', 'suicidal thoughts', 'severe burn'
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const containsEmergency = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return Array.from(emergencyKeywords).some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  };

  const classifyQuery = async (query: string): Promise<string> => {
    try {
      const routingResponse = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [
          { role: "system", content: routerPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.2,
        max_tokens: 20
      });
      return routingResponse.choices[0].message.content.toLowerCase().trim();
    } catch (error) {
      console.error("Classification error:", error);
      return 'general';
    }
  };

  const handleMessage = async (text: string) => {
    if (!text.trim()) return;

    if (containsEmergency(text)) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🚨 **Medical Emergency Detected** 🚨\n\nPlease:\n1. Call emergency services\n2. Seek immediate medical attention\n3. Follow operator instructions',
        isEmergency: true
      }]);
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let category = await classifyQuery(text);
      const validCategories = Object.keys(medicalAgentTemplates);
      if (!validCategories.includes(category)) {
        category = 'diagnosis'; // Default to diagnosis if invalid category
      }
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split('T')[0];
      const year = currentDate.getFullYear().toString();


      const filteredMessages = messages.slice(-3).map(({ role, content }) => ({ role, content }));
      const response = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [
          { 
            role: "system", 
            content: `${medicalAgentTemplates[category]}\n\nCurrent Date: ${formattedDate}\nGuidelines: CDC ${year}, WHO ${year}` 
          },
          ...filteredMessages,
          userMessage
        ],
        temperature: 0.3,
        max_tokens: 500
      });
      

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.choices[0].message.content ?? '' as string,
          sources: ["Centers for Disease Control (CDC)", "World Health Organization (WHO)"]
        }
      ]);      
    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm experiencing technical difficulties. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudioInput(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-large-v3');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: formData
      });

      const data = await response.json();
      if (data.text) {
        await handleMessage(data.text);
      }
    } catch (error) {
      toast.error('Error processing voice input');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-all"
        >
          <MessageCircle size={28} />
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[480px] h-[640px] flex flex-col">
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white rounded-t-xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} />
              <h2 className="font-bold">Medical Assistant</h2>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : msg.isEmergency
                        ? 'bg-red-100 dark:bg-red-900 border-2 border-red-500 text-red-800 dark:text-red-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ 
                    __html: msg.content.replace(/\n/g, '<br />') 
                  }} />
                  {msg.sources && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      Sources: {msg.sources.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <Loader2 className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-lg ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
                disabled={isLoading}
              >
                {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
              </button>

              <input
                value={inputMessage}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => 
                  e.key === 'Enter' && handleMessage(inputMessage)
                }
                placeholder="Describe symptoms or ask about treatments..."
                className="flex-1 p-3 border rounded-lg dark:bg-gray-900 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRecording || isLoading}
              />

              <button
                onClick={() => handleMessage(inputMessage)}
                disabled={!inputMessage.trim() || isLoading || isRecording}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
            
            <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              This AI assistant does not provide medical diagnoses. Consult a healthcare professional for medical advice.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthcareChatbot;