"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = api.getToken()
    if (!token) {
      router.push("/")
    } else {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Candidate Portal</h1>
          <Button
            variant="ghost"
            onClick={() => {
              api.setToken(null)
              router.push("/")
            }}
          >
            Sign Out
          </Button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        {children}
      </main>
    </div>
  )
}

// Need to import Button
import { Button } from "@/components/ui/button"
