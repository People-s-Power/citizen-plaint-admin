/**
 * Browser-side client for the admin governance endpoints.
 *
 * All calls go to our own Next.js API routes (never straight to the backend),
 * which inject the server-only `ADMIN_API_KEY`. We attach the admin's session
 * token so the backend knows who is acting.
 */

export interface AdminSummary {
  id: string
  userId: string
  email: string
  name: string
  role: string
  roleLabel: string
  permissions: string[]
  permissionCount: number
  isSuperAdmin: boolean
  status: "active" | "suspended"
  invitedByEmail?: string
  lastLoginAt?: string
  suspendedAt?: string | null
  suspendedReason?: string | null
  createdAt?: string
}

export interface InviteSummary {
  id: string
  email: string
  name: string
  role: string
  roleLabel: string
  permissions: string[]
  permissionCount: number
  status: "pending" | "accepted" | "expired" | "revoked"
  invitedByEmail: string
  invitedByName: string
  message: string
  expiresAt: string
  lastSentAt: string
  sendCount: number
  acceptedAt?: string
  createdAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface InviteVerification {
  valid: boolean
  email: string
  name: string
  role: string
  roleLabel: string
  permissionLabels: string[]
  invitedByName: string
  invitedByEmail: string
  message: string
  expiresAt: string
  requiresPassword: boolean
}

/** Thrown for any non-2xx response, carrying a message safe to show a user. */
export class AdminApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "AdminApiError"
    this.status = status
  }
}

function sessionToken(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("token") || ""
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  }
  const token = sessionToken()
  if (token) headers["x-admin-actor-token"] = token

  const response = await fetch(path, { ...init, headers })

  const text = await response.text()
  let data: any = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { message: text }
  }

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || "Something went wrong. Please try again."
    throw new AdminApiError(message, response.status)
  }

  return data as T
}

export const adminApi = {
  // ------------------------------- session -------------------------------
  me: () =>
    request<{ success: boolean; admin: AdminSummary }>("/api/admin/me"),

  login: (email: string, password: string) =>
    request<{ success: boolean; token: string; admin: AdminSummary }>(
      "/api/admin/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    ),

  // ------------------------------ invitations ----------------------------
  listInvites: (params: {
    status?: string
    search?: string
    page?: number
    limit?: number
  } = {}) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, String(v))
    })
    return request<{ invites: InviteSummary[]; pagination: Pagination }>(
      `/api/admin/invites${qs.toString() ? `?${qs}` : ""}`,
    )
  },

  createInvite: (payload: {
    email: string
    name?: string
    role: string
    permissions?: string[]
    message?: string
  }) =>
    request<{
      success: boolean
      emailSent: boolean
      message: string
      inviteLink: string
      invite: InviteSummary
    }>("/api/admin/invites", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resendInvite: (id: string, message?: string) =>
    request<{
      success: boolean
      emailSent: boolean
      message: string
      inviteLink: string
      invite: InviteSummary
    }>(`/api/admin/invites/${id}/resend`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  revokeInvite: (id: string, reason?: string) =>
    request<{ success: boolean; message: string }>(
      `/api/admin/invites/${id}/revoke`,
      { method: "POST", body: JSON.stringify({ reason }) },
    ),

  // -------------------------- public invite flow -------------------------
  verifyInvite: (token: string) =>
    request<InviteVerification>(
      `/api/admin/invites/verify?token=${encodeURIComponent(token)}`,
    ),

  acceptInvite: (payload: {
    token: string
    name?: string
    password?: string
  }) =>
    request<{
      success: boolean
      message: string
      token: string
      admin: AdminSummary
    }>("/api/admin/invites/accept", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ----------------------------- admin CRUD ------------------------------
  listAdmins: (params: {
    status?: string
    search?: string
    page?: number
    limit?: number
  } = {}) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, String(v))
    })
    return request<{ admins: AdminSummary[]; pagination: Pagination }>(
      `/api/admin/admins${qs.toString() ? `?${qs}` : ""}`,
    )
  },

  updateAccess: (
    id: string,
    payload: { role?: string; permissions?: string[] },
  ) =>
    request<{ success: boolean; message: string; admin: AdminSummary }>(
      `/api/admin/admins/${id}/access`,
      { method: "PATCH", body: JSON.stringify(payload) },
    ),

  updateStatus: (id: string, suspended: boolean, reason?: string) =>
    request<{ success: boolean; message: string; admin: AdminSummary }>(
      `/api/admin/admins/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ suspended, reason }) },
    ),

  removeAdmin: (id: string) =>
    request<{ success: boolean; message: string }>(
      `/api/admin/admins/${id}`,
      { method: "DELETE" },
    ),
}
