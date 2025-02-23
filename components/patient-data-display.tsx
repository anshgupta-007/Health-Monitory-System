"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

const parameters = [
  { key: "Respiratory_Rate", label: "Respiratory Rate" },
  { key: "Heart_Rate", label: "Heart Rate" },
  { key: "BP_Systolic", label: "BP Systolic" },
  { key: "BP_Diastolic", label: "BP Diastolic" },
  { key: "Temperature (°C)", label: "Temperature (°C)" },
  { key: "SpO2 (%)", label: "SpO2 (%)" },
]

export function PatientDataDisplay({ data, startDate, endDate }) {
  const filterDataByDateRange = (paramData, start, end) => {
    return paramData.filter((item) => {
      const date = new Date(item.Time_of_Recording)
      const startDateTime = start ? new Date(start) : null
      const endDateTime = end ? new Date(end) : null

      // Set the time to the end of the day for the end date
      if (endDateTime) {
        endDateTime.setUTCHours(23, 59, 59, 999)
      }

      return (!startDateTime || date >= startDateTime) && (!endDateTime || date <= endDateTime)
    })
  }

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const filteredData = filterDataByDateRange(data, startDate, endDate)

  return (
    <div className="space-y-8">
      {parameters.map((param) => {
        const minValue = Math.min(...filteredData.map((item) => Number(item[param.key])))
        const maxValue = Math.max(...filteredData.map((item) => Number(item[param.key])))

        return (
          <motion.div
            key={param.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/10">
                <CardTitle className="text-xl font-bold">{param.label}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="Time_of_Recording"
                      tickFormatter={formatXAxis}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis domain={[minValue * 0.9, maxValue * 1.1]} tickFormatter={(tick) => tick.toFixed(2)} />
                    <Tooltip
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                      formatter={(value) => Number(value).toFixed(2)}
                    />
                    <Line
                      type="monotone"
                      dataKey={param.key}
                      stroke="hsl(200, 70%, 50%)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      animationDuration={1500}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

