import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { adminApi, type AdminSummary } from "@/lib/adminApi"
import { PERMISSION_WILDCARD, inferRole } from "@/lib/adminPermissions"
import PermissionSelector from "./PermissionSelector"

interface Props {
  admin: AdminSummary | null
  onClose: () => void
  onSaved: () => void
  grantable: string[] | null
}

export default function EditAccessModal({
  admin,
  onClose,
  onSaved,
  grantable,
}: Props) {
  const [role, setRole] = useState<string>("")
  const [permissions, setPermissions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Re-seed whenever a different admin is opened.
  useEffect(() => {
    if (!admin) return
    setRole(admin.role)
    setPermissions(admin.permissions || [])
  }, [admin])

  if (!admin) return null

  const original = [...(admin.permissions || [])].sort().join("|")
  const current = [...permissions].sort().join("|")
  const dirty = original !== current
  const wasSuper = (admin.permissions || []).includes(PERMISSION_WILDCARD)
  const willBeSuper = permissions.includes(PERMISSION_WILDCARD)

  const save = async () => {
    if (!dirty || !permissions.length) return
    setSaving(true)
    try {
      const result = await adminApi.updateAccess(admin.id, {
        role: role || inferRole(permissions),
        permissions,
      })
      toast.success(result.message)
      onSaved()
      onClose()
    } catch (e: any) {
      toast.error(e?.message || "Could not update access")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manage access</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {admin.name || admin.email}
              {admin.name && (
                <span className="text-gray-400"> · {admin.email}</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-2xl leading-none text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <PermissionSelector
            role={role}
            permissions={permissions}
            grantable={grantable}
            disabled={saving}
            onChange={({ role: r, permissions: p }) => {
              setRole(r)
              setPermissions(p)
            }}
          />

          {wasSuper && !willBeSuper && (
            <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-sm font-semibold text-orange-900">
                You&apos;re downgrading a super admin
              </p>
              <p className="mt-1 text-xs text-orange-800">
                They&apos;ll lose unrestricted access immediately. This is
                blocked if they&apos;re the last active super admin.
              </p>
            </div>
          )}
          {!wasSuper && willBeSuper && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-900">
                You&apos;re promoting to super admin
              </p>
              <p className="mt-1 text-xs text-red-800">
                They&apos;ll be able to invite, suspend and remove other
                administrators — including you.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 p-5">
          <p className="text-xs text-gray-500">
            {!permissions.length
              ? "An administrator needs at least one permission."
              : dirty
                ? "They'll be emailed about this change."
                : "No changes yet."}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty || !permissions.length}
              className="rounded-lg bg-warning px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
