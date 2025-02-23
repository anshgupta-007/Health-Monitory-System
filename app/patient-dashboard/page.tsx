import { DashboardHeader } from "@/components/dashboard-header"
import { UserHealthDetails } from "@/components/user-health-details"
import { HealthMetrics } from "@/components/health-metrics"
import { RiskAssessment } from "@/components/risk-assessment"
import { Medications } from "@/components/medications"

export default function PatientDashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-primary/5">
      <DashboardHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Patient Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <UserHealthDetails
            userId="patient1"
            currentDoctor="Dr. Smith"
            roomNo="301"
            prescriptions={["Aspirin, 81mg, Daily", "Lisinopril, 10mg, Twice daily", "Metformin, 500mg, With meals"]}
          />
          <RiskAssessment />
          <HealthMetrics />
          <Medications />
        </div>
      </main>
    </div>
  )
}