// components/AnomalyGraphs.tsx

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

interface AnomalyGraphsProps {
  patientId?: string
  timeRange: string
}

const VITAL_RANGES = {
  Respiratory_Rate: { min: 12, max: 20 },
  Heart_Rate: { min: 55, max: 110 },
  BP_Systolic: { min: 80, max: 130 },
  BP_Diastolic: { min: 55, max: 85 },
  Temperature: { min: 36.1, max: 37.8 },
  SpO2: { min: 93, max: 102 },
} as const


export function AnomalyGraphs({ patientId, timeRange }: AnomalyGraphsProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const url = patientId 
          ? `/api/patient-data?patientId=${patientId}&timeRange=${timeRange}`
          : `/api/patient-data?timeRange=${timeRange}`
        
        const response = await fetch(url)
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [patientId, timeRange])

  if (loading) return <div>Loading...</div>

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem)
    return date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })
  }

  const vitalParams = [
    { key: 'Respiratory_Rate', name: 'Respiratory Rate' },
    { key: 'Heart_Rate', name: 'Heart Rate' },
    { key: 'BP_Systolic', name: 'BP Systolic' },
    { key: 'BP_Diastolic', name: 'BP Diastolic' },
    { key: 'Temperature (°C)', name: 'Temperature' },
    { key: 'SpO2 (%)', name: 'SpO2' },
  ]

  return (
    <div className="space-y-6">
      {vitalParams.map((param, index) => (
        <motion.div
          key={param.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="bg-primary/10">
              <CardTitle>{param.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="Time_of_Recording"
                      tickFormatter={formatXAxis}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                      formatter={(value: string) => Number(value).toFixed(2)}
                    />
                    <Line
                      type="monotone"
                      dataKey={param.key}
                      stroke="hsl(var(--primary))"
                      dot={({ cx, cy, payload }: any) => {
                        const value = payload[param.key]
                        const range = VITAL_RANGES[param.key.replace(/[ (°C)%]/g, '') as keyof typeof VITAL_RANGES]
                        const isAnomaly = range && (Number(value) < range.min || Number(value) > range.max)
                        
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isAnomaly ? 6 : 4}
                            fill={isAnomaly ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                            stroke="none"
                          />
                        )
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}