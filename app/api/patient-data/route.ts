// app/api/patient-data/route.ts

import { NextResponse } from "next/server"
import Papa from "papaparse"

const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/data_sm_new_1_final-N5vhrezqo00Lmh7SFYMyn8wDlZoRDS.csv"

const VITAL_RANGES = {
  Respiratory_Rate: { min: 12, max: 20 },
  Heart_Rate: { min: 55, max: 110 },
  BP_Systolic: { min: 80, max: 130 },
  BP_Diastolic: { min: 55, max: 85 },
  Temperature: { min: 36.1, max: 37.8 },
  SpO2: { min: 93, max: 102 },
} as const

interface PatientData {
  Patient_ID: string
  Day: string
  Time_of_Recording: string
  Age: string
  Gender: string
  Respiratory_Rate: string
  Heart_Rate: string
  BP_Systolic: string
  BP_Diastolic: string
  "Temperature (°C)": string
  "SpO2 (%)": string
}

let patientDataStore: PatientData[] = []
let initialized = false

async function initializeDataStore() {
  if (initialized) return
  
  try {
    console.log("Fetching CSV data from:", CSV_URL)
    const response = await fetch(CSV_URL)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    const { data, errors } = Papa.parse<PatientData>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    })

    if (errors.length > 0) {
      console.error("CSV parsing errors:", errors)
      throw new Error("Error parsing CSV data")
    }

    if (data.length === 0) {
      throw new Error("No data found in CSV")
    }

    patientDataStore = data
    initialized = true
    console.log(`Successfully loaded ${data.length} patient records`)

  } catch (error) {
    console.error("Data initialization failed:", error)
    throw error
  }
}

function generateRealtimeEntry(baseEntry: PatientData, timestamp: Date): PatientData {
  const generateInRange = (min: number, max: number) => {
    const withinRange = Math.random() < 0.85 // 85% in-range values
    if (withinRange) return min + Math.random() * (max - min)
    return Math.random() < 0.5 ? max + Math.random() * 5 : min - Math.random() * 5
  }

  return {
    ...baseEntry,
    Time_of_Recording: timestamp.toISOString(),
    Day: timestamp.getDate().toString(),
    Respiratory_Rate: generateInRange(VITAL_RANGES.Respiratory_Rate.min, VITAL_RANGES.Respiratory_Rate.max).toFixed(1),
    Heart_Rate: generateInRange(VITAL_RANGES.Heart_Rate.min, VITAL_RANGES.Heart_Rate.max).toFixed(1),
    BP_Systolic: generateInRange(VITAL_RANGES.BP_Systolic.min, VITAL_RANGES.BP_Systolic.max).toFixed(1),
    BP_Diastolic: generateInRange(VITAL_RANGES.BP_Diastolic.min, VITAL_RANGES.BP_Diastolic.max).toFixed(1),
    "Temperature (°C)": generateInRange(VITAL_RANGES.Temperature.min, VITAL_RANGES.Temperature.max).toFixed(1),
    "SpO2 (%)": generateInRange(VITAL_RANGES.SpO2.min, VITAL_RANGES.SpO2.max).toFixed(1),
  }
}

async function checkForAnomalies(data: PatientData, request: Request) {
  const anomalies = []
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const baseUrl = `${protocol}://${request.headers.get('host')}`

  const vitalChecks = [
    { name: "Respiratory Rate", value: parseFloat(data.Respiratory_Rate), range: VITAL_RANGES.Respiratory_Rate },
    { name: "Heart Rate", value: parseFloat(data.Heart_Rate), range: VITAL_RANGES.Heart_Rate },
    { name: "BP Systolic", value: parseFloat(data.BP_Systolic), range: VITAL_RANGES.BP_Systolic },
    { name: "BP Diastolic", value: parseFloat(data.BP_Diastolic), range: VITAL_RANGES.BP_Diastolic },
    { name: "Temperature", value: parseFloat(data["Temperature (°C)"]), range: VITAL_RANGES.Temperature },
    { name: "SpO2", value: parseFloat(data["SpO2 (%)"]), range: VITAL_RANGES.SpO2 },
  ]

  for (const vital of vitalChecks) {
    if (isNaN(vital.value)) {
      console.warn(`Invalid value for ${vital.name}: ${vital.value}`)
      continue
    }

    if (vital.value < vital.range.min || vital.value > vital.range.max) {
      anomalies.push({
        patientId: data.Patient_ID,
        parameter: vital.name,
        value: vital.value,
        normalRange: vital.range,
        timestamp: data.Time_of_Recording,
      })
    }
  }

  if (anomalies.length > 0) {
    try {
      const response = await fetch(`${baseUrl}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: data.Patient_ID,
          anomalies,
          timestamp: new Date().toISOString()
        }),
      })

      if (!response.ok) {
        console.error("Alert API responded with:", response.status, await response.text())
      }
    } catch (error) {
      console.error("Failed to send alert:", error)
    }
  }
}

async function generateAllPatientsData(request: Request) {
  await initializeDataStore()

  if (patientDataStore.length === 0) {
    throw new Error("No patient data available for generation")
  }

  const now = new Date()
  const updatedData: PatientData[] = []

  // Group existing data by patient
  const patients = new Map<string, PatientData[]>()
  patientDataStore.forEach(entry => {
    const id = entry.Patient_ID
    if (!patients.has(id)) patients.set(id, [])
    patients.get(id)?.push(entry)
  })

  // Generate new data for each patient
  for (const [patientId, entries] of patients) {
    const lastEntry = entries[entries.length - 1]
    let lastTimestamp = new Date(lastEntry.Time_of_Recording)
    
    const numEntries = Math.floor(Math.random() * 3) + 2 // 2-4 entries
    const timeIncrement = 15 * 60 * 1000 // Base 15 minutes between readings
    
    for (let i = 0; i < numEntries; i++) {
      // Add random variance to time increments (±5 minutes)
      const newTime = new Date(lastTimestamp.getTime() + timeIncrement + 
        (Math.random() * 10 * 60 * 1000) - (5 * 60 * 1000))
      
      if (newTime > now) break // Don't create future entries

      const newEntry = generateRealtimeEntry(lastEntry, newTime)
      updatedData.push(newEntry)
      await checkForAnomalies(newEntry, request)
      
      lastTimestamp = newTime // Update for next iteration
    }
  }

  // Update in-memory store with new data
  patientDataStore = [...patientDataStore, ...updatedData]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const patientId = searchParams.get("patientId")
  const timeRange = searchParams.get("timeRange")

  try {
    await generateAllPatientsData(request)

    let filteredData = patientDataStore

    // Filter by patient ID
    if (patientId) {
      filteredData = filteredData.filter(entry => entry.Patient_ID === patientId)
      if (filteredData.length === 0) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 })
      }
    }

    // Filter by time range
    if (timeRange) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - Number(timeRange))
      filteredData = filteredData.filter(entry => {
        const entryDate = new Date(entry.Time_of_Recording)
        return entryDate >= cutoff
      })
    }

    // For overview, return latest entry per patient
    if (!patientId) {
      const latestEntriesMap = new Map<string, PatientData>()
      filteredData.forEach(entry => {
        const currentLatest = latestEntriesMap.get(entry.Patient_ID)
        const entryDate = new Date(entry.Time_of_Recording)
        
        if (!currentLatest || entryDate > new Date(currentLatest.Time_of_Recording)) {
          latestEntriesMap.set(entry.Patient_ID, entry)
        }
      })
      
      return NextResponse.json(Array.from(latestEntriesMap.values()))
    }

    return NextResponse.json(filteredData)

  } catch (error) {
    console.error("GET request failed:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}