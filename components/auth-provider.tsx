"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  username: string
  role: "doctor" | "patient"
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const VALID_CREDENTIALS = {
  doctor: { username: "doctor", password: "password", role: "doctor" as const },
  patient1: { username: "patient1", password: "patient123", role: "patient" as const },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser?.username && parsedUser?.role) {
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error)
        localStorage.removeItem("user")
      }
    }
  }, [])

  useEffect(() => {
    const publicPaths = ["/", "/login"]
    const doctorPaths = ["/dashboard", "/doctor"]
    const patientPaths = ["/patient-dashboard"]

    if (!user && !publicPaths.includes(pathname)) {
      router.push("/login")
      return
    }

    if (user) {
      if (publicPaths.includes(pathname)) {
        router.push(user.role === "doctor" ? "/dashboard" : "/patient-dashboard")
        return
      }

      if (user.role === "patient" && doctorPaths.includes(pathname)) {
        router.push("/patient-dashboard")
        return
      }

      if (user.role === "doctor" && patientPaths.includes(pathname)) {
        router.push("/dashboard")
        return
      }
    }
  }, [user, pathname, router])

  const login = (username: string, password: string) => {
    const foundUser = Object.values(VALID_CREDENTIALS).find(
      (cred) => cred.username === username && cred.password === password
    )

    if (foundUser) {
      const userData = { username: foundUser.username, role: foundUser.role }
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}