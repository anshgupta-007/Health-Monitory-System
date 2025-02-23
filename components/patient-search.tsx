"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientDataDisplay } from "@/components/patient-data-display"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import Link from "next/link"
import HealthcareChatbot from "@/components/PatientChatBot"

export function PatientSearch() {
  const [searchId, setSearchId] = useState("")
  const [patientData, setPatientData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleSearch = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/patient-data?patientId=${searchId}`)
      console.log(response);
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch patient data")
      }
      const data = await response.json()
      if (data.length === 0) {
        throw new Error("No patient found with this ID")
      }
      setPatientData(data)
    } catch (err) {
      setError(err.message)
      setPatientData(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-4xl mx-auto p-4"
    >
      <Card className="overflow-hidden shadow-lg rounded-xl bg-white border border-gray-100">
        <CardHeader className="bg-primary/20 p-6 rounded-t-xl">
          <CardTitle className="text-3xl font-bold text-gray-800">Patient Search</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex space-x-4 mb-6">
            <Input
              type="text"
              placeholder="Enter Patient ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-grow py-3 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="py-3 px-6 bg-primary text-white rounded-md shadow-md hover:bg-primary-dark transition"
            >
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="start-date">
                Start Date
              </label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="py-3 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="end-date">
                End Date
              </label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="py-3 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {patientData && (
            <div className="mt-4">
              <Link href={`/future-forecasting?patientId=${searchId}`}>
                <Button
                  variant="outline"
                  className="py-3 px-6 border border-gray-300 text-primary rounded-md hover:bg-gray-50 transition"
                >
                  View Future Forecasting
                </Button>
              </Link>
            </div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-red-500 font-medium">
              {error}
            </motion.p>
          )}
        </CardContent>
      </Card>

      {patientData && (
        <PatientDataDisplay data={patientData} startDate={startDate} endDate={endDate} />
      )}

      <div className="mt-6">
        <HealthcareChatbot />
      </div>
    </motion.div>
  )
}
