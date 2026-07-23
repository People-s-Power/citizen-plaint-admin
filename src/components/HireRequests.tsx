import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Modal } from "rsuite"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Use a dedicated axios instance without the global baseURL override
// so requests hit the local Next.js API routes instead of the old admin backend
const api = axios.create({ baseURL: "" })

interface HireRequest {
  _id?: string
  id?: string
  orgId: string
  orgName?: string
  userId?: string
  clientUserId?: string
  clientName?: string
  clientEmail?: string
  userName?: string
  userEmail?: string
  planType: "full-time" | "part-time"
  profession?: string
  status: "pending" | "assigned" | "cancelled"
  paymentMethod: string
  paymentReference: string
  amountPaid: number
  assignedProfessionalId?: string
  assignedProfessionalName?: string
  assignedAt?: string
  assignedBy?: string
  adminNotes?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

const getRequestId = (req: HireRequest) => req._id || req.id || ""

interface Professional {
  _id?: string
  id?: string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  image?: string
  accountType?: string
  orgOperating?: any[]
}

const getProfId = (prof: Professional) => String(prof._id || prof.id || "").trim()

const HireRequests = ({ users = [] }: { users?: any[] }) => {
  const [requests, setRequests] = useState<HireRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [selectedRequest, setSelectedRequest] = useState<HireRequest | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [profSearch, setProfSearch] = useState("")
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState("")

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/hire-requests`, {
        params: { status: statusFilter || undefined, page: 1, limit: 50 },
      })
      const data = res.data?.requests || res.data || []
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      toast.error("Failed to load hire requests")
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const fetchProfessionals = async (search?: string) => {
    try {
      const res = await api.get(`/api/hire-requests/professionals`, {
        params: { search: search || undefined, limit: 20 },
      })
      setProfessionals(Array.isArray(res.data) ? res.data : [])
    } catch {
      // Fallback: filter from users prop (existing professionals)
      const filtered = (users || []).filter(
        (u: any) =>
          (u.accountType === "Admin" || u.accountType === "Editor") &&
          (!search || (u.name || "").toLowerCase().includes(search.toLowerCase()))
      )
      setProfessionals(filtered)
    }
  }

  const openAssignModal = (request: HireRequest) => {
    setSelectedRequest(request)
    setShowAssignModal(true)
    setAdminNotes("")
    setProfSearch("")
    fetchProfessionals()
  }

  const handleAssign = async (professionalId: string) => {
    if (!selectedRequest) return
    setAssigningId(professionalId)
    try {
      // Mongoose documents may serialize _id as ObjectId or string depending on transport
      const raw = selectedRequest as any
      const requestId = String(raw._id || raw.id || raw._doc?._id || "").trim()
      const profId = String(professionalId || "").trim()
      if (!requestId || !profId) {
        console.error("Assign debug — selectedRequest keys:", Object.keys(raw), "raw._id:", raw._id, "raw.id:", raw.id)
        toast.error(`Missing hire request ID (got: ${requestId || 'empty'}) or professional ID (got: ${profId || 'empty'})`)
        setAssigningId(null)
        return
      }
      await api.post(`/api/hire-requests/assign`, {
        hireRequestId: requestId,
        professionalId: profId,
        notes: adminNotes,
      })
      toast.success("Professional assigned successfully! Email notification sent to the client.")
      setShowAssignModal(false)
      setSelectedRequest(null)
      fetchRequests()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to assign professional")
    } finally {
      setAssigningId(null)
    }
  }

  const formatAmount = (amount: number) => {
    if (!amount) return "—"
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return ""
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    const diffMs = now - then
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) return "just now"
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 30) return `${diffDays}d ago`
    return `${Math.floor(diffDays / 30)}mo ago`
  }

  return (
    <div>
      {/* Status Filter Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            statusFilter === "pending"
              ? "bg-amber-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          ⏳ Pending
        </button>
        <button
          onClick={() => setStatusFilter("assigned")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            statusFilter === "assigned"
              ? "bg-green-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          ✅ Assigned
        </button>
        <button
          onClick={() => setStatusFilter("")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            statusFilter === ""
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={fetchRequests}
          className="ml-auto px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-3"></div>
          <p className="text-gray-500">Loading hire requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-lg font-medium text-gray-500">No hire requests found</p>
          <p className="text-sm text-gray-400 mt-1">New requests will appear here after payment</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={getRequestId(req)} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{req.clientName || req.userName || req.clientEmail || req.userEmail || "—"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{req.orgName || req.orgId}</p>
                    {req.userEmail && <p className="text-xs text-gray-400">{req.userEmail}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.planType === "full-time"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {req.planType === "full-time" ? "Full-Time" : "Part-Time"}
                    </span>
                    {req.profession && <p className="text-xs text-gray-500 mt-1">{req.profession}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 text-sm">{formatAmount(req.amountPaid)}</p>
                    <p className="text-xs text-gray-500 capitalize">{req.paymentMethod}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : req.status === "assigned"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                    {req.status === "assigned" && req.assignedProfessionalName && (
                      <p className="text-xs text-green-600 mt-1 font-medium">→ {req.assignedProfessionalName}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-700">{formatDate(req.createdAt)}</p>
                    <p className="text-xs text-gray-400">{timeAgo(req.createdAt)}</p>
                  </td>
                  <td className="px-5 py-4">
                    {req.status === "pending" ? (
                      <button
                        onClick={() => openAssignModal(req)}
                        className="px-4 py-2 bg-warning text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-sm"
                      >
                        Assign
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Professional Modal */}
      <Modal open={showAssignModal} onClose={() => { setShowAssignModal(false); setSelectedRequest(null) }} size="md">
        <Modal.Header>
          <div className="border-b border-gray-200 pb-3 w-full">
            <Modal.Title className="text-lg font-bold">Assign Professional</Modal.Title>
            {selectedRequest && (
              <p className="text-sm text-gray-500 mt-1">
                For: <span className="font-medium">{selectedRequest.userName || selectedRequest.userEmail}</span>
                {" · "}
                <span className="font-medium capitalize">{selectedRequest.planType}</span> plan
                {" · "}
                <span className="font-medium">{formatAmount(selectedRequest.amountPaid)}</span>
              </p>
            )}
          </div>
        </Modal.Header>
        <Modal.Body>
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search professionals by name..."
              value={profSearch}
              onChange={(e) => {
                setProfSearch(e.target.value)
                fetchProfessionals(e.target.value)
              }}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Admin Notes */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-600 block mb-1">Admin Notes (optional)</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes about this assignment..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Professional List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {professionals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium">No professionals found</p>
                <p className="text-sm mt-1">Try a different search</p>
              </div>
            ) : (
              professionals.map((prof) => (
                <div
                  key={getProfId(prof)}
                  className="p-3 flex items-center justify-between bg-[#F5F6FA] rounded-lg hover:bg-amber-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-full object-cover"
                      src={prof.image || "/user.png"}
                      alt=""
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {prof.name || `${prof.firstName || ""} ${prof.lastName || ""}`.trim() || "—"}
                      </p>
                      <p className="text-xs text-gray-500">{prof.email || prof.accountType || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {prof.orgOperating && (
                      <span className="text-xs text-gray-500">{prof.orgOperating.length} Orgs</span>
                    )}
                    <button
                      onClick={() => handleAssign(getProfId(prof))}
                      disabled={assigningId === getProfId(prof)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        assigningId === getProfId(prof)
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-warning text-white hover:opacity-90"
                      }`}
                    >
                      {assigningId === getProfId(prof) ? "Assigning..." : "Assign"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal.Body>
      </Modal>

      <ToastContainer />
    </div>
  )
}

export default HireRequests
