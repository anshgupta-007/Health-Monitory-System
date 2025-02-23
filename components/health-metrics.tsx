"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Jan", heartRate: 72, spo2: 98, temperature: 36.6 },
  { name: "Feb", heartRate: 74, spo2: 97, temperature: 36.7 },
  { name: "Mar", heartRate: 73, spo2: 98, temperature: 36.5 },
  { name: "Apr", heartRate: 75, spo2: 99, temperature: 36.8 },
  { name: "May", heartRate: 71, spo2: 98, temperature: 36.6 },
  { name: "Jun", heartRate: 73, spo2: 97, temperature: 36.7 },
]

export function HealthMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Metrics</CardTitle>
        <CardDescription>Your vital signs over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="heartRate" stroke="#8884d8" name="Heart Rate (bpm)" />
            <Line yAxisId="left" type="monotone" dataKey="spo2" stroke="#82ca9d" name="SpO2 (%)" />
            <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#ffc658" name="Temperature (°C)" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

