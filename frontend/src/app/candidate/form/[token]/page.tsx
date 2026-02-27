"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

export default function CandidateFormPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    educationLevel: "",
    address: "",
    birthday: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getCandidateProfile(params.token as string)
        if (data.profile) {
          setProfile({
            fullName: data.profile.fullName || "",
            phone: data.profile.phone || "",
            educationLevel: data.profile.educationLevel || "",
            address: data.profile.address || "",
            birthday: data.profile.birthday ? data.profile.birthday.split("T")[0] : "",
            emergencyContactName: data.profile.emergencyContactName || "",
            emergencyContactPhone: data.profile.emergencyContactPhone || "",
          })
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [params.token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      await api.updateCandidateProfile(params.token as string, profile)
      alert("Profile submitted successfully!")
      router.push("/candidate/success")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-slate-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <p className="text-slate-500 mt-2">
            Please fill in your information below
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={profile.birthday}
                  onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Education Level
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={profile.educationLevel}
                  onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="high_school">High School</option>
                  <option value="diploma">Diploma</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <Input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Emergency Contact Name
                </label>
                <Input
                  type="text"
                  value={profile.emergencyContactName}
                  onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Emergency Contact Phone
                </label>
                <Input
                  type="tel"
                  value={profile.emergencyContactPhone}
                  onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
