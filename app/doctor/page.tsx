import { DoctorDashboard } from "@/components/doctor-dashboard"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DoctorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-primary/5">
      <DashboardHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Doctor Dashboard</h1>
        <DoctorDashboard />
      </main>
    </div>
  )
}

