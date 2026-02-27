const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem("token", token)
    } else {
      localStorage.removeItem("token")
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem("token")
    }
    return this.token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }))
      throw new Error(error.error || "Request failed")
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, fullName: string) {
    return this.request<{ token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
    })
  }

  async getMe() {
    return this.request<any>("/api/auth/me")
  }

  // Candidates
  async getCandidates() {
    return this.request<any[]>("/api/admin/candidates")
  }

  async getCandidate(id: string) {
    return this.request<any>(`/api/admin/candidates/${id}`)
  }

  async createCandidate(email: string, fullName: string) {
    return this.request<any>("/api/admin/candidates", {
      method: "POST",
      body: JSON.stringify({ email, fullName }),
    })
  }

  async deleteCandidate(id: string) {
    return this.request<any>(`/api/admin/candidates/${id}`, { method: "DELETE" })
  }

  async resendEmail(id: string) {
    return this.request<any>(`/api/admin/candidates/${id}/resend-email`, {
      method: "POST",
    })
  }

  // Milestones
  async getMilestoneTypes() {
    return this.request<any[]>("/api/admin/milestones/types")
  }

  async getTimeline(candidateId: string) {
    return this.request<any[]>(`/api/admin/milestones/candidate/${candidateId}/timeline`)
  }

  async addMilestone(data: {
    candidateId: string
    milestoneTypeId: string
    customName?: string
    milestoneDate: string
    notes?: string
  }) {
    return this.request<any>("/api/admin/milestones", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteMilestone(id: string) {
    return this.request<any>(`/api/admin/milestones/${id}`, { method: "DELETE" })
  }

  // Candidate profile (public)
  async getCandidateProfile(token: string) {
    const response = await fetch(`${API_URL}/api/candidate/profile/${token}`)
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }))
      throw new Error(error.error || "Request failed")
    }
    return response.json()
  }

  async updateCandidateProfile(token: string, data: any) {
    const response = await fetch(`${API_URL}/api/candidate/profile/${token}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }))
      throw new Error(error.error || "Request failed")
    }
    return response.json()
  }
}

export const api = new ApiClient()
