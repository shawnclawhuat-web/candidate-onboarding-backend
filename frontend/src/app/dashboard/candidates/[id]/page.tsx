"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { Timeline } from "@/components/Timeline"
import { ArrowLeft, Plus, Trash2, Calendar } from "lucide-react"

interface CandidateDetail {
  id: string
  email: string
  status: string
  profile: {
    fullName: string
    phone?: string
    educationLevel?: string
    address?: string
    birthday?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
  } | null
  milestones: {
    id: string
    milestoneDate: string
    customName?: string
    notes?: string
    milestoneType: {
      name: string
      displayName: string
      icon: string
      color: string
    }
  }[]
}

interface MilestoneType {
  id: string
  name: string
  displayName: string
}

export default function CandidateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null)
  const [milestoneTypes, setMilestoneTypes] = useState<MilestoneType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [newMilestone, setNewMilestone] = useState({
    milestoneTypeId: "",
    customName: "",
    milestoneDate: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const [candidateData, typesData] = await Promise.all([
        api.getCandidate(params.id as string),
        api.getMilestoneTypes(),
      ])
      setCandidate(candidateData)
      setMilestoneTypes(typesData)
    } catch (error) {
      console.error("Failed to fetch:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [params.id])

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.addMilestone({
        candidateId: params.id as string,
        ...newMilestone,
      })
      setShowAddMilestone(false)
      setNewMilestone({ milestoneTypeId: "", customName: "", milestoneDate: "", notes: "" })
      fetchData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm("Delete this milestone?")) return
    try {
      await api.deleteMilestone(milestoneId)
      fetchData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Candidate not found</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Candidates
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-500">Name</label>
              <p className="font-medium">{candidate.profile?.fullName || "—"}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Email</label>
              <p className="font-medium">{candidate.email}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Phone</label>
              <p className="font-medium">{candidate.profile?.phone || "—"}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Education</label>
              <p className="font-medium">{candidate.profile?.educationLevel || "—"}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Address</label>
              <p className="font-medium">{candidate.profile?.address || "—"}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Emergency Contact</label>
              <p className="font-medium">
                {candidate.profile?.emergencyContactName || "—"}
                {candidate.profile?.emergencyContactPhone && (
                  <span className="text-slate-500"> ({candidate.profile.emergencyContactPhone})</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Status</label>
              <p className="font-medium capitalize">{candidate.status.replace("_", " ")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Timeline</CardTitle>
            <Button size="sm" onClick={() => setShowAddMilestone(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </CardHeader>
          <CardContent>
            <Timeline
              events={candidate.milestones}
              className="max-h-[500px] overflow-y-auto pr-4"
            />
          </CardContent>
        </Card>
      </div>

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Milestone</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMilestone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Milestone Type
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={newMilestone.milestoneTypeId}
                    onChange={(e) => setNewMilestone({ ...newMilestone, milestoneTypeId: e.target.value })}
                    required
                  >
                    <option value="">Select type...</option>
                    {milestoneTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Custom Name (optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Interview Round 2"
                    value={newMilestone.customName}
                    onChange={(e) => setNewMilestone({ ...newMilestone, customName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={newMilestone.milestoneDate}
                    onChange={(e) => setNewMilestone({ ...newMilestone, milestoneDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm min-h-[80px]"
                    placeholder="Add any notes..."
                    value={newMilestone.notes}
                    onChange={(e) => setNewMilestone({ ...newMilestone, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddMilestone(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Milestone"}
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
