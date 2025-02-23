"use client"

import { useState, useEffect } from "react"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { NotificationsMenu } from "@/components/notifications-menu"

export function DashboardHeader() {
  const { setTheme, theme } = useTheme()
  const [currentTime, setCurrentTime] = useState("")
  const pathname = usePathname()
  const { user, logout } = useAuth()

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }
      setCurrentTime(now.toLocaleTimeString("en-IN", options))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const showAnomalyButton = pathname === "/dashboard" && user?.role === "doctor"
  const isLoginPage = pathname === "/"

  return (
    <header className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link
              href={isLoginPage ? "/" : user?.role === "doctor" ? "/dashboard" : "/patient-dashboard"}
              className="text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground to-primary-foreground/90">
                HealthGuard
              </span>
            </Link>
            {user && (
              <span className="text-sm font-medium bg-primary-foreground/10 px-4 py-2 rounded-full">
                Welcome, Aditya ({user.role})
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium bg-primary-foreground/10 px-4 py-2 rounded-full">
              {currentTime}
            </span>
            
            {showAnomalyButton && (
              <Link href="/doctor">
                <Button variant="secondary" className="shadow-sm hover:shadow-md transition-shadow">
                  Anomaly Detection
                </Button>
              </Link>
            )}

            <div className="flex items-center space-x-2">
              {user && <NotificationsMenu />}
              {user && (
                <Button 
                  variant="secondary" 
                  onClick={logout}
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  Logout
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground shadow-sm hover:shadow-md transition-all"
              >
                {theme === "dark" ? (
                  <SunIcon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}