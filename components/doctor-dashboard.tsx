"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { AnomalyGraphs } from "@/components/anomaly-graphs"
import { motion } from "framer-motion"

type TimeRange = "1" | "7" | "10"

interface AnomalyResult {
  Patient_ID: string
  Last_1_day: string
  Last_7_days: string
  Last_10_days: string
}

interface ParsedAnomaly {
  parameter: string
  range: {
    min: number
    max: number
  }
  sideEffects: string[]
  precautions: string[]
}

export function DoctorDashboard() {
  const [patientId, setPatientId] = useState("")
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1")
  const [anomalyResult, setAnomalyResult] = useState<AnomalyResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/anomaly-results?patientId=${patientId}`)
      if (!response.ok) throw new Error("Failed to fetch anomaly results")
      const data = await response.json()
      if (!data) throw new Error("No patient found with this ID")
      setAnomalyResult(data)
    } catch (err: any) {
      setError(err.message)
      setAnomalyResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getResultForRange = () => {
    if (!anomalyResult) return null
    switch (selectedRange) {
      case "1": return anomalyResult.Last_1_day
      case "7": return anomalyResult.Last_7_days
      case "10": return anomalyResult.Last_10_days
    }
  }

  const parseAnomalyResult = (result: string): { isFit: boolean; anomalies: ParsedAnomaly[] } => {
    if (result === "fit") return { isFit: true, anomalies: [] }

    const anomalies = result.split(" | ")
      .map((anomalyStr) => {
        try {
          const [parameterPart, effectsPart] = anomalyStr.split(": Side Effects: ")
          const [parameter, rangeStr] = parameterPart.replace("anomaly - ", "").split(" (range: ")
          const [min, max] = rangeStr.replace(")", "").split(" - ").map(Number)
          const [sideEffects, precautions] = effectsPart.split("; Precautions: ")

          return {
            parameter,
            range: { min, max },
            sideEffects: sideEffects.split(/,\s*/).filter(Boolean),
            precautions: precautions.split(/,\s*/).filter(Boolean)
          }
        } catch (error) {
          console.error("Error parsing anomaly:", error)
          return null
        }
      })
      .filter(Boolean) as ParsedAnomaly[]

    return { isFit: false, anomalies }
  }

  const result = getResultForRange()
  const parsedResult = result ? parseAnomalyResult(result) : null

  const sendEmail = async () => {
    const res = await fetch('/api/send-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '22ucc219@lnmiit.ac.in',
        title: 'Welcome!',
        body: '<h1>Hello there!</h1>',
      }),
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="bg-primary/10">
          <CardTitle>Patient Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Enter Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          <button onClick={sendEmail}>Send Email</button>

          <div className="flex space-x-2 mb-4">
            {(["1", "7", "10"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={selectedRange === range ? "default" : "outline"}
                onClick={() => setSelectedRange(range)}
              >
                Last {range} Day{range !== "1" ? "s" : ""}
              </Button>
            ))}
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive">
              {error}
            </motion.p>
          )}

          {parsedResult && (
            <div className="mt-4">
              {parsedResult.isFit ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-green-100 dark:bg-green-900 rounded-lg"
                >
                  <p className="text-green-700 dark:text-green-100">
                    Patient is fit with no anomalies detected in the last {selectedRange} day(s).
                  </p>
                </motion.div>
              ) : (
                <>
                  <AnomalyGraphs
                    patientId={patientId}
                    anomalies={parsedResult.anomalies}
                    timeRange={selectedRange}
                  />
                  {parsedResult.anomalies.map((anomaly, index) => (
                    <motion.div
                      key={`${anomaly.parameter}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg"
                    >
                      <h3 className="font-semibold mb-2 text-lg">
                        {anomaly.parameter} Anomaly Detected
                      </h3>
                      <p className="mb-2">
                        Observed range: {anomaly.range.min} - {anomaly.range.max}
                      </p>

                      <div className="space-y-3">
                        {anomaly.sideEffects.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-1">Potential Side Effects:</h4>
                            <ul className="list-disc list-inside pl-2">
                              {anomaly.sideEffects.map((effect, i) => (
                                <li key={i}>{effect}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {anomaly.precautions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-1">Recommended Precautions:</h4>
                            <ul className="list-disc list-inside pl-2">
                              {anomaly.precautions.map((precaution, i) => (
                                <li key={i}>{precaution}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

