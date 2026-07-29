import { useCallback, useEffect, useMemo, useState } from "react"
import { useAtom } from "jotai"
import { adminAtom } from "@/atoms/adminAtom"
import { adminApi, AdminApiError, type AdminSummary } from "@/lib/adminApi"
import { can, expandPermissions } from "@/lib/adminPermissions"

/**
 * Single source of truth for "who am I and what may I do?" in the dashboard.
 *
 * On mount we re-fetch `/api/admin/me` rather than trusting the cached copy in
 * localStorage — that way a permission change or suspension takes effect on the
 * next page load instead of lingering until the token expires.
 */
export function useAdminSession() {
  const [cached, setCached] = useAtom<AdminSummary | null>(adminAtom as any)
  const [admin, setAdmin] = useState<AdminSummary | null>(cached ?? null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const { admin: fresh } = await adminApi.me()
      setAdmin(fresh)
      setCached(fresh as any)
      return fresh
    } catch (e: any) {
      const status = e instanceof AdminApiError ? e.status : 0
      // 401/403 means the session is gone or access was pulled — clear it.
      if (status === 401 || status === 403) {
        setAdmin(null)
        setCached(null as any)
      }
      setError(e?.message || "Could not load your admin profile")
      return null
    } finally {
      setLoading(false)
    }
  }, [setCached])

  useEffect(() => {
    // No token at all: don't bother round-tripping.
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      setLoading(false)
      return
    }
    refresh()
  }, [refresh])

  /** Concrete permission list with `*` already expanded. */
  const permissions = useMemo(
    () => (admin ? expandPermissions(admin.permissions || []) : null),
    [admin],
  )

  const check = useCallback(
    (required: string | string[]) => can(permissions, required),
    [permissions],
  )

  return {
    admin,
    permissions,
    /** `can("admins.invite")` — accepts a single key or an "any of" array. */
    can: check,
    isSuperAdmin: Boolean(admin?.isSuperAdmin),
    loading,
    error,
    refresh,
  }
}
