export interface VitalRange {
    min: number
    max: number
  }
  
  export interface VitalRanges {
    Respiratory_Rate: VitalRange
    Heart_Rate: VitalRange
    BP_Systolic: VitalRange
    BP_Diastolic: VitalRange
    Temperature: VitalRange
    SpO2: VitalRange
  }
  
  export interface Alert {
    id: string
    patientId: string
    timestamp: string
    parameter: string
    value: number
    normalRange: VitalRange
    status: "pending" | "addressed"
    prescription?: string
  }