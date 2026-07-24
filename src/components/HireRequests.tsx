import React, { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Modal } from "rsuite"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Use a dedicated axios instance without the global baseURL override
// so requests hit the local Next.js API routes instead of the old admin backend
const api = axios.create({ baseURL: "" })

const DEFAULT_CATEGORY = "General Administrative Assistant"

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
  assignedProfessionalEmail?: string
  assignedProfessionalImage?: string
  assignedAt?: string
  assignedBy?: string
  adminNotes?: string
  notes?: string
  requirementsInfo?: {
    businessDescription?: string
    keyTasks?: string[]
    preferredTimezone?: string
    workingHours?: string
    industry?: string
    communicationPreference?: string[]
    specialRequirements?: string
    urgency?: string
  } | null
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
  profession?: any
  orgOperating?: any[]
}

const getProfId = (prof: Professional) => String(prof._id || prof.id || "").trim()

const PROFESSIONS = [
  "General Administrative Assistant",
  "Social Media Manager ",
  "Real Estate",
  "Virtual Research",
  "Virtual Data Entry",
  "Virtual Book keeper",
  "Virtual ecommerce",
  "Customer Service Provider (Phone/Chat",
  "Content Writer",
  "Website Management",
  "Public Relation Assistant",
  "Graphic designs",
  "Appointment/Calendar setter",
  "Email Management",
  "Campaign/petition Writer",
]

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
  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_CATEGORY)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailsRequest, setDetailsRequest] = useState<HireRequest | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const categories = PROFESSIONS

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

  const filterProfessionals = (category: string, search?: string) => {
    const filtered = (users || []).filter((u: any) => {
      // Must be Admin or Editor to be a professional user? 
      // User.jsx filters by accountType === 'Admin' | 'Editor'. Let's keep it safe.
      // Wait, actually, if they have a profession, they are a professional. 
      // But let's check what the old fallback did:
      // (u.accountType === "Admin" || u.accountType === "Editor")
      // Let's just trust the profession field if category is set.
      
      // Filter by search
      if (search && search.trim() !== "") {
        const val = search.trim().toLowerCase();
        const matchesName = (u.name || "").toLowerCase().includes(val) || 
                            (u.firstName || "").toLowerCase().includes(val) || 
                            (u.lastName || "").toLowerCase().includes(val);
        if (!matchesName) return false;
      }

      // Filter by category
      if (category && category !== "All") {
        if (!u.profession) return false;
        
        if (Array.isArray(u.profession)) {
          const hasMatchingProf = u.profession.some((p: any) => p.name === category || p === category);
          if (!hasMatchingProf) return false;
        } else if (u.profession !== category) {
          return false;
        }
      }
      
      return true;
    });
    setProfessionals(filtered);
  }

  const openAssignModal = (request: HireRequest) => {
    setSelectedRequest(request)
    setShowAssignModal(true)
    setAdminNotes("")
    setProfSearch("")
    setSelectedCategory(DEFAULT_CATEGORY)
    filterProfessionals(DEFAULT_CATEGORY)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setProfSearch("")
    filterProfessionals(category)
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
      toast.success("Professional assigned successfully! Email notifications sent to both the client and the professional.")
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

  const isAssignedView = statusFilter === "assigned"

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
                {isAssignedView && <th className="px-5 py-3">Assigned To</th>}
                <th className="px-5 py-3">{isAssignedView ? "Assigned Date" : "Submitted"}</th>
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
                  </td>
                  {isAssignedView && (
                    <td className="px-5 py-4">
                      {req.assignedProfessionalName ? (
                        <div className="flex items-center gap-2">
                          {req.assignedProfessionalImage && (
                            <img
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              src={req.assignedProfessionalImage}
                              alt=""
                            />
                          )}
                          <div>
                            <p className="font-semibold text-green-700 text-sm">{req.assignedProfessionalName}</p>
                            {req.assignedProfessionalEmail && (
                              <p className="text-xs text-gray-400">{req.assignedProfessionalEmail}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not populated</span>
                      )}
                    </td>
                  )}
                  <td className="px-5 py-4">
                    {isAssignedView && req.assignedAt ? (
                      <>
                        <p className="text-sm text-gray-700">{formatDate(req.assignedAt)}</p>
                        <p className="text-xs text-gray-400">{timeAgo(req.assignedAt)}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700">{formatDate(req.createdAt)}</p>
                        <p className="text-xs text-gray-400">{timeAgo(req.createdAt)}</p>
                      </>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {req.status === "pending" ? (
                        <button
                          onClick={() => openAssignModal(req)}
                          className="px-4 py-2 bg-warning text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-sm"
                        >
                          Assign
                        </button>
                      ) : req.status === "assigned" ? (
                        <span className="text-xs text-green-600 font-medium">✓ Assigned</span>
                      ) : (
                        <span className="text-xs text-gray-400">Done</span>
                      )}
                      {/* Ellipsis menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(openMenuId === getRequestId(req) ? null : getRequestId(req))
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-700"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="3" r="1.5" />
                            <circle cx="8" cy="8" r="1.5" />
                            <circle cx="8" cy="13" r="1.5" />
                          </svg>
                        </button>
                        {openMenuId === getRequestId(req) && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                              <button
                                onClick={() => {
                                  setDetailsRequest(req)
                                  setShowDetailsModal(true)
                                  setOpenMenuId(null)
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                                View Details
                              </button>
                              {req.status === "pending" && (
                                <button
                                  onClick={() => {
                                    openAssignModal(req)
                                    setOpenMenuId(null)
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="20" y1="8" x2="20" y2="14" />
                                    <line x1="23" y1="11" x2="17" y2="11" />
                                  </svg>
                                  Assign Professional
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
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
            <Modal.Title className="text-lg font-bold">Assign a Professional</Modal.Title>
            {selectedRequest && (
              <p className="text-sm text-gray-500 mt-1">
                For: <span className="font-medium">{selectedRequest.clientName || selectedRequest.userName || selectedRequest.userEmail}</span>
                {" · "}
                <span className="font-medium capitalize">{selectedRequest.planType}</span> plan
                {" · "}
                <span className="font-medium">{formatAmount(selectedRequest.amountPaid)}</span>
              </p>
            )}
          </div>
        </Modal.Header>
        <Modal.Body>
          {/* Search & Category Filter */}
          <div className="mb-4 flex flex-row items-end gap-3">
            {/* Search */}
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                Search Professional
              </label>
              <input
                type="text"
                placeholder={`Search by name...`}
                value={profSearch}
                onChange={(e) => {
                  setProfSearch(e.target.value)
                  filterProfessionals(selectedCategory, e.target.value)
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Category Filter */}
            <div className="w-[45%] shrink-0">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
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
                <p className="font-medium">No {selectedCategory}s found</p>
                <p className="text-sm mt-1">Only verified professionals in this category will appear here.</p>
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
                      <p className="text-xs text-gray-500">{prof.email || ""}</p>
                      {prof.profession && (
                        <p className="text-xs text-amber-600 font-medium mt-0.5">
                          {Array.isArray(prof.profession) 
                            ? prof.profession.map((p: any) => p.name || p).join(", ")
                            : prof.profession}
                        </p>
                      )}
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

      {/* View Details Modal */}
      <Modal open={showDetailsModal} onClose={() => { setShowDetailsModal(false); setDetailsRequest(null) }} size="md">
        <Modal.Header>
          <div className="border-b border-gray-200 pb-3 w-full">
            <Modal.Title className="text-lg font-bold">Hire Request Details</Modal.Title>
            {detailsRequest && (
              <p className="text-sm text-gray-500 mt-1">
                {detailsRequest.clientName || detailsRequest.userName || "Client"} · {detailsRequest.orgName || detailsRequest.orgId}
              </p>
            )}
          </div>
        </Modal.Header>
        <Modal.Body>
          {detailsRequest && (
            <div className="space-y-6">
              {/* Request Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Plan Type</p>
                  <p className="text-sm font-bold text-gray-900 mt-1 capitalize">{detailsRequest.planType}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Amount Paid</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{formatAmount(detailsRequest.amountPaid)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Payment Method</p>
                  <p className="text-sm font-bold text-gray-900 mt-1 capitalize">{detailsRequest.paymentMethod}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${
                    detailsRequest.status === "pending" ? "bg-amber-100 text-amber-700"
                    : detailsRequest.status === "assigned" ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}>
                    {detailsRequest.status.charAt(0).toUpperCase() + detailsRequest.status.slice(1)}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Client Email</p>
                  <p className="text-sm text-gray-900 mt-1">{detailsRequest.clientEmail || detailsRequest.userEmail || "—"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Submitted</p>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(detailsRequest.createdAt)}</p>
                </div>
              </div>

              {/* Requirements Info Section */}
              {detailsRequest.requirementsInfo ? (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Client Requirements
                  </h4>
                  <div className="space-y-4">
                    {detailsRequest.requirementsInfo.businessDescription && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Business Description</p>
                        <p className="text-sm text-gray-800 bg-white rounded-lg p-3">{detailsRequest.requirementsInfo.businessDescription}</p>
                      </div>
                    )}
                    {detailsRequest.requirementsInfo.industry && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Industry</p>
                        <span className="inline-block px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700">{detailsRequest.requirementsInfo.industry}</span>
                      </div>
                    )}
                    {detailsRequest.requirementsInfo.keyTasks && detailsRequest.requirementsInfo.keyTasks.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Key Tasks</p>
                        <div className="flex flex-wrap gap-1.5">
                          {detailsRequest.requirementsInfo.keyTasks.map((task, i) => (
                            <span key={i} className="inline-block px-2.5 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                              {task}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailsRequest.requirementsInfo.preferredTimezone && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Preferred Timezone</p>
                        <p className="text-sm text-gray-800">{detailsRequest.requirementsInfo.preferredTimezone}</p>
                      </div>
                    )}
                    {detailsRequest.requirementsInfo.workingHours && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Working Hours</p>
                        <p className="text-sm text-gray-800">{detailsRequest.requirementsInfo.workingHours}</p>
                      </div>
                    )}
                    {detailsRequest.requirementsInfo.communicationPreference && detailsRequest.requirementsInfo.communicationPreference.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Communication Preferences</p>
                        <div className="flex flex-wrap gap-1.5">
                          {detailsRequest.requirementsInfo.communicationPreference.map((pref, i) => (
                            <span key={i} className="inline-block px-2.5 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                              {pref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailsRequest.requirementsInfo.specialRequirements && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Special Requirements</p>
                        <p className="text-sm text-gray-800 bg-white rounded-lg p-3">{detailsRequest.requirementsInfo.specialRequirements}</p>
                      </div>
                    )}
                    {detailsRequest.requirementsInfo.urgency && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Urgency</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          detailsRequest.requirementsInfo.urgency === "immediate" ? "bg-red-100 text-red-700"
                          : detailsRequest.requirementsInfo.urgency === "this-week" ? "bg-orange-100 text-orange-700"
                          : detailsRequest.requirementsInfo.urgency === "next-week" ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                        }`}>
                          {detailsRequest.requirementsInfo.urgency === "immediate" ? "Immediately (within 24 hours)"
                          : detailsRequest.requirementsInfo.urgency === "this-week" ? "This week"
                          : detailsRequest.requirementsInfo.urgency === "next-week" ? "Next week"
                          : "Flexible / No rush"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 bg-gray-50 rounded-xl p-5 text-center">
                  <p className="text-sm text-gray-500 italic">No requirements information submitted by the client.</p>
                </div>
              )}

              {/* Admin Notes */}
              {(detailsRequest.notes || detailsRequest.adminNotes) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Admin Notes</p>
                  <p className="text-sm text-gray-800">{detailsRequest.notes || detailsRequest.adminNotes}</p>
                </div>
              )}

              {/* Assigned Professional Info */}
              {detailsRequest.assignedProfessionalName && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-green-700 uppercase mb-2">Assigned Professional</p>
                  <div className="flex items-center gap-3">
                    {detailsRequest.assignedProfessionalImage && (
                      <img className="w-10 h-10 rounded-full object-cover" src={detailsRequest.assignedProfessionalImage} alt="" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{detailsRequest.assignedProfessionalName}</p>
                      {detailsRequest.assignedProfessionalEmail && <p className="text-xs text-gray-500">{detailsRequest.assignedProfessionalEmail}</p>}
                      {detailsRequest.assignedAt && <p className="text-xs text-gray-400 mt-0.5">Assigned on {formatDate(detailsRequest.assignedAt)}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      <ToastContainer />
    </div>
  )
}

export default HireRequests
