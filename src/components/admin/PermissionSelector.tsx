import React from "react"
import {
  PERMISSION_GROUPS,
  PERMISSION_WILDCARD,
  ROLE_PRESETS,
  AdminRole,
  getRolePreset,
  inferRole,
} from "@/lib/adminPermissions"

interface Props {
  role: string
  permissions: string[]
  onChange: (next: { role: string; permissions: string[] }) => void
  /**
   * Permissions the *acting* admin holds. Anything outside this set is disabled,
   * because the backend will reject granting a permission you don't have.
   * `null` means unrestricted (super admin).
   */
  grantable: string[] | null
  disabled?: boolean
}

/**
 * Role presets + granular permission checkboxes.
 *
 * Picking a preset overwrites the checkbox state; ticking any individual box
 * flips the role to "custom" so the two never disagree.
 */
export default function PermissionSelector({
  role,
  permissions,
  onChange,
  grantable,
  disabled,
}: Props) {
  const isSuper = permissions.includes(PERMISSION_WILDCARD)
  const canGrantAll = grantable === null

  const mayGrant = (key: string) =>
    canGrantAll || (grantable || []).includes(key)

  const selectPreset = (presetKey: string) => {
    const preset = getRolePreset(presetKey)
    if (!preset) return
    // Silently drop anything the actor can't hand out, so the request won't 403.
    const allowed = preset.permissions.filter(
      (p) => p === PERMISSION_WILDCARD || mayGrant(p),
    )
    onChange({ role: presetKey, permissions: allowed })
  }

  const togglePermission = (key: string) => {
    // Leaving super-admin mode: start from the concrete list.
    const base = isSuper ? [] : permissions
    const next = base.includes(key)
      ? base.filter((p) => p !== key)
      : [...base, key]
    onChange({ role: inferRole(next), permissions: next })
  }

  const selectedCount = isSuper
    ? PERMISSION_GROUPS.reduce((n, g) => n + g.permissions.length, 0)
    : permissions.length

  return (
    <div className="space-y-5">
      {/* ---------------------------- Role presets ---------------------------- */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Role
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {ROLE_PRESETS.map((preset) => {
            const blocked =
              preset.key === AdminRole.SuperAdmin && !canGrantAll
            const selected = role === preset.key
            return (
              <button
                key={preset.key}
                type="button"
                disabled={disabled || blocked}
                onClick={() => selectPreset(preset.key)}
                title={
                  blocked
                    ? "Only a super admin can grant unrestricted access"
                    : preset.description
                }
                className={`text-left p-3 rounded-lg border transition ${
                  selected
                    ? "border-warning bg-yellow-50 ring-1 ring-warning"
                    : "border-gray-200 hover:border-gray-300"
                } ${
                  disabled || blocked
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-900">
                    {preset.label}
                  </span>
                  {selected && (
                    <span className="text-warning text-xs font-bold">✓</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-snug">
                  {preset.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* -------------------------- Granular controls ------------------------- */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-800">
            Permissions
          </label>
          <span className="text-xs text-gray-500">
            {selectedCount} selected
            {role === AdminRole.Custom && " · custom"}
          </span>
        </div>

        {isSuper ? (
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-900 font-medium">
              Unrestricted access
            </p>
            <p className="text-xs text-yellow-800 mt-1">
              This person will be able to do anything on the platform, including
              inviting and removing other administrators. Untick a box below to
              switch to a limited, custom role.
            </p>
          </div>
        ) : null}

        <div
          className={`mt-3 space-y-4 max-h-72 overflow-y-auto pr-1 ${
            isSuper ? "opacity-60" : ""
          }`}
        >
          {PERMISSION_GROUPS.map((group) => (
            <div key={group.key}>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-1.5">
                {group.permissions.map((permission) => {
                  const allowed = mayGrant(permission.key)
                  const checked =
                    isSuper || permissions.includes(permission.key)
                  return (
                    <label
                      key={permission.key}
                      title={
                        allowed
                          ? permission.description
                          : "You don't have this permission, so you can't grant it"
                      }
                      className={`flex items-start gap-2.5 p-2 rounded-md ${
                        allowed && !disabled
                          ? "hover:bg-gray-50 cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-warning"
                        checked={checked}
                        disabled={disabled || !allowed}
                        onChange={() => togglePermission(permission.key)}
                      />
                      <span>
                        <span className="text-sm text-gray-900">
                          {permission.label}
                          {permission.sensitive && (
                            <span className="ml-1.5 text-[10px] font-bold uppercase text-red-600 align-middle">
                              sensitive
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-gray-500 leading-snug">
                          {permission.description}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
