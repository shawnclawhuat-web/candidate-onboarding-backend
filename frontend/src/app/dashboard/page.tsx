"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { UserPlus, Search, MoreVertical, Trash2, Mail, ExternalLink } from "lucide-react"

interface Candidate {
  id: string
  email: string
  status: string
  profile: {
    fullName: string
  } | null
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchCandidates = async () => {
    try {
      const data = await api.getCandidates()
      setCandidates(data)
    } catch (error) {
      console.error("Failed to fetch candidates:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [])

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.createCandidate(newEmail, newName)
      setShowAddModal(false)
      setNewEmail("")
      setNewName("")
      fetchCandidates()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this candidate?")) return
    try {
      await api.deleteCandidate(id)
      fetchCandidates()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleResend = async (id: string) => {
    try {
      await api.resendEmail(id)
      alert("Email resent!")
    } catch (error: any) {
      alert(error.message)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      profile_completed: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-slate-100"}`}>
        {status.replace("_", " ")}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Candidates</h2>
          <p className="text-slate-500">Manage your candidate onboarding</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserPlus className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No candidates yet</h3>
            <p className="text-slate-500 mb-4">Add your first candidate to get started</p>
            <Button onClick={() => setShowAddModal(true)}>Add Candidate</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {candidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {(candidate.profile?.fullName || candidate.email)[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {candidate.profile?.fullName || "—"}
                      </h3>
                      <p className="text-sm text-slate-500">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(candidate.status)}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResend(candidate.id)}
                        title="Resend email"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                        title="View details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(candidate.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Candidate</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCandidate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="candidate@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? "Sending..." : "Send Invite"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
