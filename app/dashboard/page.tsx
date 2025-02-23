import { DashboardHeader } from "@/components/dashboard-header"
import { PatientSearch } from "@/components/patient-search"

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-primary/5">
      <DashboardHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Patient Health Dashboard</h1>
        <PatientSearch />
      </main>
    </div>
  )
}