/**
 * AdminShell
 * ----------------------------------------------------------------------------
 * The console frame: fixed sidebar, sticky topbar, scrolling content well.
 *
 * Why a shell instead of the old inline 20/80 flex split:
 *  - Navigation stays put while a long table scrolls (no lost context).
 *  - Nav is grouped by job-to-be-done, so a reviewer finds the moderation
 *    queues without reading all ten links.
 *  - Sidebar collapses to icons on smaller screens and turns into a drawer on
 *    mobile, so the dashboard is usable on a laptop or tablet.
 *  - Permission filtering happens in one place; empty groups disappear.
 */
import React, { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

export type NavItem = {
  key: string
  label: string
  /** Permission required to see the entry (backend enforces it too). */
  permission: string
  /** Destructive/audit surfaces get a red accent. */
  danger?: boolean
  /** Live count, e.g. pending queue size. */
  badge?: number
  icon: React.ReactNode
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

/* --------------------------------- icons ---------------------------------- */
/* Inline strokes keep the bundle lean and let colour follow `currentColor`.  */

const svg = (path: React.ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-[18px] w-[18px]"
    aria-hidden="true"
  >
    {path}
  </svg>
)

export const NavIcons = {
  overview: svg(
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="10" width="7" height="11" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>,
  ),
  content: svg(
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9h10M7 13h6" />
    </>,
  ),
  tasks: svg(
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17" />
    </>,
  ),
  users: svg(
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 20a6 6 0 0 0-3-5.2" />
    </>,
  ),
  reports: svg(
    <>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v5M12 17h.01" />
    </>,
  ),
  money: svg(
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </>,
  ),
  subscriptions: svg(
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
      <path d="M20.5 4v5h-5" />
    </>,
  ),
  hire: svg(
    <>
      <rect x="2.5" y="7" width="19" height="13" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M2.5 12h19" />
    </>,
  ),
  trash: svg(
    <>
      <path d="M4 7h16M10 4h4M9 7v11M15 7v11" />
      <path d="M6 7l1 13h10l1-13" />
    </>,
  ),
  shield: svg(
    <>
      <path d="M12 3l7.5 3v6c0 4.2-3 7.6-7.5 9-4.5-1.4-7.5-4.8-7.5-9V6L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </>,
  ),
}

/* ------------------------------- nav config ------------------------------- */

export function NavLink({
  item,
  active,
  collapsed,
  onSelect,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onSelect: (key: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.key)}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300",
        collapsed && "justify-center px-0",
        active
          ? item.danger
            ? "bg-rose-50 text-rose-700"
            : "bg-[#00401C] text-white"
          : item.danger
            ? "text-rose-600/90 hover:bg-rose-50 hover:text-rose-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && !!item.badge && (
        <span
          className={cn(
            "ml-auto rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
            active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800",
          )}
        >
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
      {collapsed && !!item.badge && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
      )}
    </button>
  )
}

export default function AdminShell({
  groups,
  active,
  onNavigate,
  title,
  loading,
  admin,
  onSignOut,
  children,
}: {
  groups: NavGroup[]
  active: string
  onNavigate: (key: string) => void
  /** Current section label, shown in the breadcrumb. */
  title?: string
  /** Permissions still resolving — render nav placeholders instead of links. */
  loading?: boolean
  admin?: { name?: string; email?: string; roleLabel?: string } | null
  onSignOut?: () => void
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Remember the collapsed preference — admins live in this UI all day.
  useEffect(() => {
    const saved = localStorage.getItem("admin.sidebar.collapsed")
    if (saved === "1") setCollapsed(true)
  }, [])
  useEffect(() => {
    localStorage.setItem("admin.sidebar.collapsed", collapsed ? "1" : "0")
  }, [collapsed])

  // Close the mobile drawer whenever the section changes.
  useEffect(() => setMobileOpen(false), [active])

  const initials = useMemo(() => {
    const source = admin?.name || admin?.email || ""
    return (
      source
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("") || "A"
    )
  }, [admin])

  const sidebar = (
    <nav
      aria-label="Admin sections"
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      {/* brand */}
      <div
        className={cn(
          "flex h-16 flex-shrink-0 items-center gap-2.5 border-b border-slate-200 px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#00401C] text-sm font-bold text-[#FDC332]">
          E
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-900">
              ExpertHub
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Admin console
            </span>
          </span>
        )}
      </div>

      {/* groups */}
      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="mx-1 h-8 animate-pulse rounded-lg bg-slate-100"
              />
            ))
          : groups.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.key}
                      item={item}
                      active={item.key === active}
                      collapsed={collapsed}
                      onSelect={onNavigate}
                    />
                  ))}
                </div>
              </div>
            ))}
      </div>

      {/* collapse toggle */}
      <div className="flex-shrink-0 border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "hidden w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 lg:flex",
            collapsed && "justify-center px-0",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            aria-hidden="true"
          >
            <path d="m14 6-6 6 6 6" />
          </svg>
          {!collapsed && "Collapse"}
        </button>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        {/* desktop sidebar */}
        <div className="sticky top-0 hidden h-screen flex-shrink-0 md:block">
          {sidebar}
        </div>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 h-full shadow-xl">{sidebar}</div>
          </div>
        )}

        {/* main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>

            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center gap-1.5 text-sm">
                <li className="hidden text-slate-400 sm:block">Admin</li>
                <li className="hidden text-slate-300 sm:block" aria-hidden="true">
                  /
                </li>
                <li className="truncate font-semibold text-slate-900">
                  {title || "Overview"}
                </li>
              </ol>
            </nav>

            <div className="ml-auto flex items-center gap-2">
              {/* identity — makes it obvious which account is acting */}
              <div className="hidden items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-3 sm:flex">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00401C] text-[11px] font-bold text-[#FDC332]">
                  {initials}
                </span>
                <span className="leading-tight">
                  <span className="block max-w-[160px] truncate text-xs font-semibold text-slate-900">
                    {admin?.name || admin?.email || "Admin"}
                  </span>
                  {admin?.roleLabel && (
                    <span className="block text-[11px] text-slate-500">
                      {admin.roleLabel}
                    </span>
                  )}
                </span>
              </div>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Sign out
                </button>
              )}
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
