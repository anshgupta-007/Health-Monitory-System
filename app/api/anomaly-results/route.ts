import { NextResponse } from "next/server"
import Papa from "papaparse"

const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/anomaly_results_final_2200-UVge1QiiokyzQ9NK6qgtXMRa2G20WZ.csv"

interface AnomalyResult {
  Patient_ID: string
  Last_1_day: string
  Last_7_days: string
  Last_10_days: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get("patientId")

  const response = await fetch(CSV_URL)
  const csvText = await response.text()

  const { data } = Papa.parse<AnomalyResult>(csvText, { header: true })

  if (patientId) {
    const patientData = data.find((row) => row.Patient_ID === patientId)
    return NextResponse.json(patientData || null)
  }

  return NextResponse.json(data)
}

