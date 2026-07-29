import React, { useMemo, useState } from "react"
import { toast } from "react-toastify"
import { adminApi } from "@/lib/adminApi"
import {
  AdminRole,
  PERMISSION_WILDCARD,
  getRolePreset,
} from "@/lib/adminPermissions"
import PermissionSelector from "./PermissionSelector"

interface Props {
  open: boolean
  onClose: () => void
  onInvited: () => void
  /** Permissions the acting admin holds; `null` = unrestricted. */
  grantable: string[] | null
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function InviteAdminModal({
  open,
  onClose,
  onInvited,
  grantable,
}: Props) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [role, setRole] = useState<string>(AdminRole.Support)
  const [permissions, setPermissions] = useState<string[]>(
    getRolePreset(AdminRole.Support)?.permissions ?? [],
  )
  const [submitting, setSubmitting] = useState(false)
  /** Shown after success so the operator can share the link if email failed. */
  const [sentLink, setSentLink] = useState<string | null>(null)

  const emailError = useMemo(() => {
    if (!email) return null
    return EMAIL_RE.test(email.trim()) ? null : "Enter a valid email address"
  }, [email])

  const canSubmit =
    !submitting && !!email.trim() && !emailError && permissions.length > 0

  const reset = () => {
    setEmail("")
    setName("")
    setMessage("")
    setRole(AdminRole.Support)
    setPermissions(getRolePreset(AdminRole.Support)?.permissions ?? [])
    setSentLink(null)
  }

  const close = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const result = await adminApi.createInvite({
        email: email.trim().toLowerCase(),
        name: name.trim() || undefined,
        role,
        // Always send the explicit list so a "custom" tweak isn't silently
        // overwritten by the preset on the server.
        permissions,
        message: message.trim() || undefined,
      })

      if (result.emailSent) {
        toast.success(result.message)
        reset()
        onInvited()
        onClose()
      } else {
        // SMTP degraded — keep the modal open and surface the link.
        toast.warn(result.message)
        setSentLink(result.inviteLink)
        onInvited()
      }
    } catch (e: any) {
      toast.error(e?.message || "Could not send the invitation")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        {/* header */}
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Invite an administrator
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              They&apos;ll get an email with a secure, single-use link that
              expires in 7 days.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="text-2xl leading-none text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* body */}
        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
          {sentLink && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-sm font-medium text-orange-900">
                The invitation was created, but the email didn&apos;t go out.
              </p>
              <p className="mt-1 text-xs text-orange-800">
                Share this single-use link with them directly:
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  readOnly
                  value={sentLink}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 rounded border border-orange-300 bg-white px-2 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(sentLink)
                    toast.info("Link copied")
                  }}
                  className="rounded bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                autoComplete="off"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 ${
                  emailError
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:border-warning focus:ring-warning"
                }`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-600">{emailError}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">
                Full name{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-warning focus:ring-1 focus:ring-warning"
              />
            </div>
          </div>

          <PermissionSelector
            role={role}
            permissions={permissions}
            grantable={grantable}
            disabled={submitting}
            onChange={({ role: nextRole, permissions: nextPermissions }) => {
              setRole(nextRole)
              setPermissions(nextPermissions)
            }}
          />

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">
              Personal note{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Hey! Joining you to help with moderation this quarter."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-warning focus:ring-1 focus:ring-warning"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {message.length}/500
            </p>
          </div>

          {permissions.includes(PERMISSION_WILDCARD) && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-900">
                You&apos;re granting unrestricted access
              </p>
              <p className="mt-1 text-xs text-red-800">
                This person will be able to invite, suspend and remove other
                administrators — including you. Only do this for people you fully
                trust.
              </p>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-100 p-5">
          <p className="text-xs text-gray-500">
            {permissions.length === 0
              ? "Select at least one permission."
              : "They can start immediately after accepting."}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={close}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {sentLink ? "Done" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="rounded-lg bg-warning px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send invitation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
