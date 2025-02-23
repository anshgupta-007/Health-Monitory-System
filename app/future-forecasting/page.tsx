import { DashboardHeader } from "@/components/dashboard-header"
import { FutureForecasting } from "@/components/future-forecasting"

export default function FutureForecastingPage({ searchParams }: { searchParams: { patientId: string } }) {
  const { patientId } = searchParams

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-primary/5">
      <DashboardHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Future Forecasting</h1>
        <FutureForecasting patientId={patientId} />
      </main>
    </div>
  )
}

