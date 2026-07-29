import React, { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import {
  adminApi,
  type AdminSummary,
  type InviteSummary,
} from "@/lib/adminApi"
import { AdminPermission, PERMISSION_WILDCARD } from "@/lib/adminPermissions"
import { useAdminSession } from "@/hooks/useAdminSession"
import InviteAdminModal from "./InviteAdminModal"
import EditAccessModal from "./EditAccessModal"

type Tab = "admins" | "invites"

function timeAgo(value?: string): string {
  if (!value) return "—"
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(value).toLocaleDateString()
}

function expiresIn(value: string): string {
  const diff = new Date(value).getTime() - Date.now()
  if (diff <= 0) return "expired"
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `expires in ${hours}h`
  return `expires in ${Math.floor(hours / 24)}d`
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  expired: "bg-gray-100 text-gray-600",
  revoked: "bg-gray-100 text-gray-600",
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  )
}

/**
 * Administrator governance panel: who has access, what they can do, and the
 * outstanding invitations.
 */
export default function Administrators() {
  const { admin: me, permissions, can, isSuperAdmin, loading: sessionLoading } =
    useAdminSession()

  const [tab, setTab] = useState<Tab>("admins")
  const [admins, setAdmins] = useState<AdminSummary[]>([])
  const [invites, setInvites] = useState<InviteSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editing, setEditing] = useState<AdminSummary | null>(null)
  /** Tracks the row-level action in flight, so we only spin one button. */
  const [busyId, setBusyId] = useState<string | null>(null)

  const mayInvite = can(AdminPermission.AdminsInvite)
  const mayManageAccess = can(AdminPermission.AdminsManageAccess)
  const mayRemove = can(AdminPermission.AdminsRemove)
  const mayView = can(AdminPermission.AdminsView)

  /** What the current admin is allowed to hand out. `null` = everything. */
  const grantable = isSuperAdmin ? null : permissions

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [adminsRes, invitesRes] = await Promise.all([
        adminApi.listAdmins({ search: search || undefined, limit: 100 }),
        adminApi.listInvites({ limit: 100 }),
      ])
      setAdmins(adminsRes.admins)
      setInvites(invitesRes.invites)
    } catch (e: any) {
      toast.error(e?.message || "Could not load administrators")
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    if (sessionLoading || !mayView) return
    load()
  }, [load, sessionLoading, mayView])

  // Debounce the search box so we don't fire on every keystroke.
  useEffect(() => {
    if (sessionLoading || !mayView) return
    const t = setTimeout(load, 350)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (id: string, fn: () => Promise<{ message: string }>) => {
    setBusyId(id)
    try {
      const result = await fn()
      toast.success(result.message)
      await load()
    } catch (e: any) {
      toast.error(e?.message || "Action failed")
    } finally {
      setBusyId(null)
    }
  }

  const suspend = (target: AdminSummary) => {
    const reason = window.prompt(
      `Suspend ${target.email}? They'll lose admin access immediately.\n\nReason (optional, included in their email):`,
    )
    if (reason === null) return
    run(target.id, () =>
      adminApi.updateStatus(target.id, true, reason || undefined),
    )
  }

  const reactivate = (target: AdminSummary) =>
    run(target.id, () => adminApi.updateStatus(target.id, false))

  const remove = (target: AdminSummary) => {
    if (
      !window.confirm(
        `Remove admin access for ${target.email}?\n\nTheir regular ExpertHub account stays intact, but they'll lose the admin console entirely. This can't be undone — you'd have to re-invite them.`,
      )
    )
      return
    run(target.id, () => adminApi.removeAdmin(target.id))
  }

  const revoke = (invite: InviteSummary) => {
    if (
      !window.confirm(
        `Revoke the invitation to ${invite.email}?\n\nThe link in their email will stop working immediately.`,
      )
    )
      return
    run(invite.id, () => adminApi.revokeInvite(invite.id))
  }

  const resend = (invite: InviteSummary) =>
    run(invite.id, async () => {
      const result = await adminApi.resendInvite(invite.id)
      if (!result.emailSent) {
        // Surface the fresh link so the operator isn't stuck.
        window.prompt("Email failed to send. Share this link:", result.inviteLink)
      }
      return result
    })

  // ---------------------------- render guards ----------------------------

  if (sessionLoading) {
    return (
      <div className="py-16 text-center text-sm text-gray-500">
        Loading your permissions…
      </div>
    )
  }

  if (!mayView) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-lg font-semibold text-gray-800">
          You don&apos;t have access to this section
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Managing administrators requires the &ldquo;View admins&rdquo;
          permission. Ask a super admin if you need it.
        </p>
      </div>
    )
  }

  const pendingCount = invites.filter((i) => i.status === "pending").length

  return (
    <div>
      {/* -------------------------------- header ------------------------------- */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Administrators</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Control who can access the admin console and exactly what they can
            do.
          </p>
        </div>
        {mayInvite && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-white"
          >
            + Invite admin
          </button>
        )}
      </div>

      {/* --------------------------------- tabs -------------------------------- */}
      <div className="mb-4 flex items-center gap-5 border-b border-gray-200">
        {(
          [
            ["admins", `Admins (${admins.length})`],
            ["invites", `Invitations${pendingCount ? ` (${pendingCount})` : ""}`],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 pb-2 text-sm font-medium transition ${
              tab === key
                ? "border-warning text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto pb-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-warning"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">Loading…</div>
      ) : tab === "admins" ? (
        /* ------------------------------ admins list ----------------------------- */
        admins.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">No administrators found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Administrator</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Access</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Last active</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {admins.map((row) => {
                  const isMe = row.id === me?.id
                  const busy = busyId === row.id
                  // Only a super admin may touch another super admin.
                  const locked = row.isSuperAdmin && !isSuperAdmin
                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {row.name || "—"}
                          {isMe && (
                            <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-600">
                              you
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{row.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-800">{row.roleLabel}</span>
                        {row.isSuperAdmin && (
                          <span className="ml-1.5 text-xs text-warning">★</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.permissions?.includes(PERMISSION_WILDCARD)
                          ? "Unrestricted"
                          : `${row.permissionCount} permissions`}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={row.status} />
                        {row.suspendedReason && (
                          <div
                            className="mt-0.5 max-w-[160px] truncate text-xs text-gray-500"
                            title={row.suspendedReason}
                          >
                            {row.suspendedReason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {timeAgo(row.lastLoginAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {mayManageAccess && !isMe && !locked && (
                            <button
                              type="button"
                              onClick={() => setEditing(row)}
                              disabled={busy}
                              className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50"
                            >
                              Access
                            </button>
                          )}
                          {mayRemove && !isMe && !locked && (
                            <>
                              {row.status === "active" ? (
                                <button
                                  type="button"
                                  onClick={() => suspend(row)}
                                  disabled={busy}
                                  className="text-xs font-semibold text-orange-600 hover:underline disabled:opacity-50"
                                >
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => reactivate(row)}
                                  disabled={busy}
                                  className="text-xs font-semibold text-green-600 hover:underline disabled:opacity-50"
                                >
                                  Reactivate
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => remove(row)}
                                disabled={busy}
                                className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </>
                          )}
                          {(isMe || locked) && (
                            <span className="text-xs text-gray-400">
                              {isMe ? "—" : "Super admin only"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      ) : /* ----------------------------- invites list ---------------------------- */
      invites.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-500">No invitations yet.</p>
          {mayInvite && (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="mt-3 text-sm font-semibold text-warning hover:underline"
            >
              Invite your first admin
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Invitee</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Invited by</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Sent</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {invites.map((row) => {
                const busy = busyId === row.id
                const actionable = row.status === "pending" || row.status === "expired"
                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {row.email}
                      </div>
                      {row.name && (
                        <div className="text-xs text-gray-500">{row.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{row.roleLabel}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.invitedByName || row.invitedByEmail}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                      {row.status === "pending" && (
                        <div className="mt-0.5 text-xs text-gray-500">
                          {expiresIn(row.expiresAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {timeAgo(row.lastSentAt)}
                      {row.sendCount > 1 && (
                        <span className="ml-1 text-xs text-gray-400">
                          ({row.sendCount}×)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {mayInvite && actionable && (
                          <button
                            type="button"
                            onClick={() => resend(row)}
                            disabled={busy}
                            className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50"
                          >
                            {busy ? "…" : "Resend"}
                          </button>
                        )}
                        {mayInvite && row.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => revoke(row)}
                            disabled={busy}
                            className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        )}
                        {!actionable && row.status !== "pending" && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <InviteAdminModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={load}
        grantable={grantable}
      />
      <EditAccessModal
        admin={editing}
        onClose={() => setEditing(null)}
        onSaved={load}
        grantable={grantable}
      />
    </div>
  )
}
