import { DashboardHeader } from "@/components/dashboard-header"
import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-primary/5">
      <DashboardHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Health Monitoring System Login</h1>
        <LoginForm />
      </main>
    </div>
  )
}