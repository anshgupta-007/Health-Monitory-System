"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertTriangle, Loader2 } from "lucide-react"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: "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",
  dangerouslyAllowBrowser: true
})

interface ApiResponse {
  status: string
  patient_id: string
  predictions: {
    timestamps: string[]
    values: {
      Respiratory_Rate: number[]
      Heart_Rate: number[]
      BP_Systolic: number[]
      BP_Diastolic: number[]
      "Temperature (°C)": number[]
      "SpO2 (%)": number[]
      "Creatinine (mg/dL)": number[]
    }
  }
}

interface ForecastData {
  timestamps: string[]
  values: {
    Respiratory_Rate: number[]
    Heart_Rate: number[]
    BP_Systolic: number[]
    BP_Diastolic: number[]
    "Temperature (°C)": number[]
    "SpO2 (%)": number[]
    "Creatinine (mg/dL)": number[]
  }
}

interface MedicalInsights {
  parameter: string
  insight: string
  precaution: string
  severity: 'normal' | 'warning' | 'critical'
}

interface AIInsight {
  parameter: string
  analysis: string
  clinicalImplications: string
  recommendedActions: string
  urgency: 'routine' | 'urgent' | 'critical'
}

const normalRanges = {
  'Respiratory_Rate': { min: 12, max: 20 },
  'Heart_Rate': { min: 60, max: 100 },
  'BP_Systolic': { min: 90, max: 120 },
  'BP_Diastolic': { min: 60, max: 80 },
  'Temperature (°C)': { min: 36.1, max: 37.2 },
  'SpO2 (%)': { min: 95, max: 100 },
  'Creatinine (mg/dL)': { min: 0.6, max: 1.2 }
} as const;

const healthParameters = [
  'Respiratory_Rate',
  'Heart_Rate',
  'BP_Systolic',
  'BP_Diastolic',
  'Temperature (°C)',
  'SpO2 (%)',
  'Creatinine (mg/dL)'
] as const;

const generateInsights = (parameter: keyof typeof normalRanges, values: number[]): MedicalInsights => {
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length
  const trend = values[values.length - 1] - values[0]
  const range = normalRanges[parameter]

  let insight = ''
  let precaution = ''
  let severity: 'normal' | 'warning' | 'critical' = 'normal'

  const trendThreshold = (range.max - range.min) * 0.2
  const trendDescription = Math.abs(trend) > trendThreshold 
    ? trend > 0 ? 'significant increasing trend' : 'significant decreasing trend'
    : 'stable trend'

  if (avgValue < range.min * 0.9 || avgValue > range.max * 1.1) {
    severity = 'critical'
    insight = `Critical ${avgValue < range.min ? 'low' : 'high'} values detected (Average: ${avgValue.toFixed(1)})`
    precaution = 'Immediate medical attention required'
  } else if (avgValue < range.min || avgValue > range.max) {
    severity = 'warning'
    insight = `${avgValue < range.min ? 'Below' : 'Above'} normal range (Average: ${avgValue.toFixed(1)}) with ${trendDescription}`
    precaution = 'Schedule clinical consultation'
  } else {
    insight = `Normal range (Average: ${avgValue.toFixed(1)}) with ${trendDescription}`
    precaution = 'Maintain regular monitoring'
  }

  switch(parameter) {
    case 'SpO2 (%)':
      if (avgValue < 92) {
        severity = 'critical'
        precaution = 'Consider oxygen therapy and urgent evaluation'
      }
      break
    case 'Heart_Rate':
      if (Math.abs(trend) > 10) {
        insight += trend > 0 
          ? ', indicating possible tachycardia' 
          : ', indicating possible bradycardia'
        precaution = trend > 0 
          ? 'Recommend ECG and electrolyte check' 
          : 'Check for cardiac abnormalities'
      }
      break
    case 'Respiratory_Rate':
      if (trend > 5) {
        insight += ', suggesting respiratory distress'
        precaution = 'Consider pulmonary evaluation'
      }
      break
    case 'Creatinine (mg/dL)':
      if (avgValue > 1.5) {
        insight += ', potential kidney dysfunction'
        precaution = 'Recommend renal function tests'
      }
      break
    case 'BP_Systolic':
      if (avgValue > 140) {
        insight += ', potential hypertension'
        precaution = 'Monitor for cardiovascular risks'
      }
      break
  }

  return { parameter, insight, precaution, severity }
}

const generateAIInsights = async (
  parameter: keyof typeof normalRanges,
  values: number[]
): Promise<AIInsight> => {
  const prompt = `As a senior medical specialist, analyze these vital signs:
  
  Parameter: ${parameter}
  Values over 72 hours (4-hour intervals): ${values.map(v => v.toFixed(2)).join(', ')}

  Provide:
  1. Clinical trend analysis
  2. Potential implications
  3. Recommended interventions
  4. Urgency level (routine/urgent/critical)

  Respond in JSON format: {
    "parameter": "${parameter}",
    "analysis": "...",
    "clinicalImplications": "...",
    "recommendedActions": "...",
    "urgency": "..."
  }`

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error("Empty AI response")
    
    const result = JSON.parse(content)
    return {
      parameter,
      analysis: result.analysis,
      clinicalImplications: result.clinicalImplications,
      recommendedActions: result.recommendedActions,
      urgency: result.urgency.toLowerCase() as AIInsight['urgency']
    }
  } catch (error) {
    console.error("AI Analysis Error:", error)
    return {
      parameter,
      analysis: "AI analysis unavailable",
      clinicalImplications: "Consult clinical team",
      recommendedActions: "Manual evaluation required",
      urgency: "routine"
    }
  }
}

export function FutureForecasting({ patientId }: { patientId: string }) {
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [insights, setInsights] = useState<MedicalInsights[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/predictions/${patientId}`)
        if (!response.ok) throw new Error("Failed to fetch forecast data")
        
        const data: ApiResponse = await response.json()
        if (data.status !== "success") {
          throw new Error("API returned non-success status")
        }
        setForecastData(data.predictions)
      } catch (err) {
        setError("Error fetching forecast data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [patientId])

  useEffect(() => {
    if (forecastData) {
      const generated = healthParameters.map(param => 
        generateInsights(param, forecastData.values[param])
      )
      setInsights(generated)

      const fetchAIInsights = async () => {
        setAiLoading(true)
        setAiError(null)
        try {
          const aiResults = await Promise.all(
            healthParameters.map(async (param) => 
              generateAIInsights(param, forecastData.values[param])
            )
          )
          setAiInsights(aiResults)
        } catch (err) {
          setAiError("Failed to generate AI insights")
          console.error(err)
        } finally {
          setAiLoading(false)
        }
      }
      
      fetchAIInsights()
    }
  }, [forecastData])

  if (loading) return <div className="text-center p-4">Loading forecast data...</div>
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>
  if (!forecastData) return <div className="text-center p-4">No forecast data available</div>

  return (
    <div className="space-y-8 p-4">
      {healthParameters.map((param, index) => {
        const chartData = forecastData.timestamps.map((timestamp, i) => ({
          timestamp,
          value: forecastData.values[param][i],
        }))

        const paramInsight = insights.find(i => i.parameter === param)
        const aiInsight = aiInsights.find(i => i.parameter === param)
        const minValue = Math.min(...forecastData.values[param])
        const maxValue = Math.max(...forecastData.values[param])

        return (
          <motion.div
            key={param}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">{param}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis domain={[minValue * 0.95, maxValue * 1.05]} />
                      <Tooltip
                        labelFormatter={(label) => new Date(label).toLocaleString()}
                        formatter={(value: number) => [
                          value.toFixed(2),
                          param
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 bg-muted/50 p-4">
                {paramInsight && (
                  <Alert variant={paramInsight.severity} className="w-full">
                    <div className="flex items-start gap-2">
                      {paramInsight.severity === 'critical' ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : (
                        <Info className="h-5 w-5 text-foreground" />
                      )}
                      <div className="flex-1">
                        <AlertTitle className="mb-2">
                          {paramInsight.severity === 'critical' ? 'Critical Alert' : 
                           paramInsight.severity === 'warning' ? 'Warning' : 'Insight'}
                        </AlertTitle>
                        <AlertDescription className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-sm">Automated Analysis:</p>
                            <p className="text-sm">{paramInsight.insight}</p>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Recommended Action:</p>
                            <p className="text-sm">{paramInsight.precaution}</p>
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}

                {aiLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing with clinical AI...
                  </div>
                ) : aiInsight ? (
                  <Alert className={`w-full border-l-4 ${
                    aiInsight.urgency === 'critical' ? 'border-red-500 bg-red-50' :
                    aiInsight.urgency === 'urgent' ? 'border-orange-500 bg-orange-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 mt-1" />
                      <div className="flex-1">
                        <AlertTitle className="mb-2 font-semibold">
                          AI Clinical Analysis ({aiInsight.urgency})
                        </AlertTitle>
                        <AlertDescription className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium">Trend Analysis:</p>
                            <p>{aiInsight.analysis}</p>
                          </div>
                          <div>
                            <p className="font-medium">Clinical Implications:</p>
                            <p>{aiInsight.clinicalImplications}</p>
                          </div>
                          <div>
                            <p className="font-medium">Recommendations:</p>
                            <p>{aiInsight.recommendedActions}</p>
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ) : aiError && (
                  <Alert variant="destructive" className="w-full">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>AI Analysis Error</AlertTitle>
                    <AlertDescription>{aiError}</AlertDescription>
                  </Alert>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}