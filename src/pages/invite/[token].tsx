import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { setCookie } from "cookies-next"
import { useSetAtom } from "jotai"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { adminAtom } from "@/atoms/adminAtom"
import { adminApi, type InviteVerification } from "@/lib/adminApi"

/**
 * Public invitation landing page: `/invite/<token>`
 *
 * Three states:
 *   1. verifying  — validating the token server-side
 *   2. invalid    — expired / revoked / already used
 *   3. valid      — show what's being offered + accept form
 *
 * Existing ExpertHub users only confirm; brand-new people set a password here,
 * which creates their account and admin record in one shot.
 */
export default function AcceptInvitePage() {
  const router = useRouter()
  const token = typeof router.query.token === "string" ? router.query.token : ""

  const setAdmin = useSetAtom(adminAtom)
  const [invite, setInvite] = useState<InviteVerification | null>(null)
  const [verifying, setVerifying] = useState(true)
  const [invalidReason, setInvalidReason] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!router.isReady || !token) return
    let cancelled = false

    ;(async () => {
      try {
        const result = await adminApi.verifyInvite(token)
        if (cancelled) return
        setInvite(result)
        setName(result.name || "")
      } catch (e: any) {
        if (cancelled) return
        setInvalidReason(
          e?.message || "This invitation link is invalid or has expired.",
        )
      } finally {
        if (!cancelled) setVerifying(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router.isReady, token])

  const passwordError = useMemo(() => {
    if (!invite?.requiresPassword || !password) return null
    if (password.length < 8) return "Use at least 8 characters"
    return null
  }, [invite, password])

  const confirmError = useMemo(() => {
    if (!invite?.requiresPassword || !confirm) return null
    return password === confirm ? null : "Passwords don't match"
  }, [invite, password, confirm])

  const canSubmit =
    !!invite &&
    !submitting &&
    (!invite.requiresPassword ||
      (!!name.trim() &&
        password.length >= 8 &&
        password === confirm))

  const accept = async () => {
    if (!canSubmit || !invite) return
    setSubmitting(true)
    try {
      const result = await adminApi.acceptInvite({
        token,
        name: name.trim() || undefined,
        password: invite.requiresPassword ? password : undefined,
      })

      // Sign them straight in — no second login step.
      localStorage.setItem("token", result.token)
      setCookie("token", result.token)
      setAdmin(result.admin as any)

      toast.success(result.message)
      setTimeout(() => {
        window.location.href = "/admin?page=summary"
      }, 900)
    } catch (e: any) {
      toast.error(e?.message || "Could not accept the invitation")
      setSubmitting(false)
    }
  }

  // ------------------------------ verifying ------------------------------
  if (verifying) {
    return (
      <Shell>
        <div className="py-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-warning" />
          <p className="mt-4 text-sm text-gray-500">
            Checking your invitation…
          </p>
        </div>
      </Shell>
    )
  }

  // ------------------------------- invalid -------------------------------
  if (invalidReason || !invite) {
    return (
      <Shell>
        <div className="py-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl">
            ⚠️
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            This invitation can&apos;t be used
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            {invalidReason}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Ask whoever invited you to send a fresh invitation, or{" "}
            <a href="/" className="font-semibold text-warning hover:underline">
              sign in
            </a>{" "}
            if you already have access.
          </p>
        </div>
        <ToastContainer />
      </Shell>
    )
  }

  // -------------------------------- valid --------------------------------
  return (
    <Shell>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Admin invitation
        </p>
        <h1 className="mt-1.5 text-2xl font-bold text-gray-900">
          You&apos;ve been invited to help run ExpertHub
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          <strong className="text-gray-900">{invite.invitedByName}</strong>{" "}
          invited <strong className="text-gray-900">{invite.email}</strong> to
          join the admin console as{" "}
          <strong className="text-gray-900">{invite.roleLabel}</strong>.
        </p>

        {invite.message && (
          <div className="mt-4 rounded-lg border-l-4 border-warning bg-yellow-50 p-3">
            <p className="text-sm italic text-yellow-900">
              &ldquo;{invite.message}&rdquo;
            </p>
            <p className="mt-1 text-xs text-yellow-700">
              — {invite.invitedByName}
            </p>
          </div>
        )}

        {/* what they'll be able to do */}
        <div className="mt-5 rounded-lg bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            What you&apos;ll be able to do
          </p>
          <ul className="mt-2 space-y-1">
            {invite.permissionLabels.map((label) => (
              <li key={label} className="flex gap-2 text-sm text-gray-700">
                <span className="font-bold text-green-600">✓</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* accept form */}
        <div className="mt-6 space-y-4">
          {invite.requiresPassword ? (
            <>
              <p className="text-sm text-gray-600">
                You don&apos;t have an ExpertHub account yet — set one up below.
              </p>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-warning"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Choose a password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                    passwordError
                      ? "border-red-400"
                      : "border-gray-300 focus:border-warning"
                  }`}
                />
                {passwordError && (
                  <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${
                    confirmError
                      ? "border-red-400"
                      : "border-gray-300 focus:border-warning"
                  }`}
                />
                {confirmError && (
                  <p className="mt-1 text-xs text-red-600">{confirmError}</p>
                )}
              </div>
            </>
          ) : (
            <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              You already have an ExpertHub account for{" "}
              <strong>{invite.email}</strong>. Accept below and sign in with your
              existing password next time.
            </p>
          )}

          <button
            type="button"
            onClick={accept}
            disabled={!canSubmit}
            className="w-full rounded-lg bg-warning py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Setting up your access…"
              : invite.requiresPassword
                ? "Create account & accept"
                : "Accept invitation"}
          </button>

          <p className="text-center text-xs text-gray-400">
            This invitation expires{" "}
            {new Date(invite.expiresAt).toLocaleString()}. If you weren&apos;t
            expecting it, you can safely close this page.
          </p>
        </div>
      </div>
      <ToastContainer />
    </Shell>
  )
}

/** Minimal standalone chrome — this page must work before the user has a session. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <title>Admin invitation | ExpertHub</title>
      <div className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-5 text-center">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Expert<span className="text-warning">Hub</span>
            </span>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
