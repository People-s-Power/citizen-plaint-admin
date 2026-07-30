/**
 * Admin UI kit
 * ----------------------------------------------------------------------------
 * The single source of truth for how the admin console looks. Every screen is
 * expected to compose these primitives instead of hand-rolling tables, badges
 * and empty states, so the whole console stays visually consistent and any
 * future polish lands everywhere at once.
 *
 * Design language
 *  - Neutral slate canvas, white elevated panels, hairline borders.
 *  - Amber (`warning`) is reserved for the primary action + active nav only.
 *  - Semantic colour is carried by StatusPill/Callout tones, never ad-hoc hexes.
 *  - Data density: 12px uppercase column headers, 14px rows, generous padding.
 */
import React from "react"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* Tones                                                                       */
/* -------------------------------------------------------------------------- */

export type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"

const PILL_TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  accent: "bg-violet-50 text-violet-700 ring-violet-200",
}

const DOT_TONES: Record<Tone, string> = {
  neutral: "bg-slate-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-sky-500",
  accent: "bg-violet-500",
}

/* -------------------------------------------------------------------------- */
/* Page header                                                                 */
/* -------------------------------------------------------------------------- */

export function PageHeader({
  title,
  description,
  actions,
  meta,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  /** Primary/secondary buttons, right aligned. */
  actions?: React.ReactNode
  /** Small supporting line under the description (counts, last sync, etc). */
  meta?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-start justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        )}
        {meta && <div className="mt-2 text-xs text-slate-400">{meta}</div>}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Buttons                                                                     */
/* -------------------------------------------------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "subtle"

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-warning text-slate-900 shadow-sm hover:bg-amber-400 focus-visible:ring-amber-500/40",
  secondary:
    "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-400/40",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400/40",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500/40",
  subtle:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400/40",
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    size?: "sm" | "md"
    icon?: React.ReactNode
    loading?: boolean
  }
>(function Button(
  {
    variant = "secondary",
    size = "md",
    icon,
    loading,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors",
        "focus:outline-none focus-visible:ring-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
        BUTTON_VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <Spinner className="h-3.5 w-3.5" /> : icon}
      {children}
    </button>
  )
})

/** Compact icon-only trigger, used inside table rows. */
export function IconButton({
  label,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors",
        "hover:bg-slate-100 hover:text-slate-900",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/** Text-style row action. Keeps destructive intent visually distinct. */
export function RowAction({
  tone = "neutral",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "neutral" | "primary" | "warning" | "danger"
}) {
  const tones = {
    neutral: "text-slate-600 hover:text-slate-900",
    primary: "text-sky-600 hover:text-sky-800",
    warning: "text-amber-600 hover:text-amber-800",
    danger: "text-rose-600 hover:text-rose-800",
  }
  return (
    <button
      type="button"
      className={cn(
        "rounded text-xs font-semibold underline-offset-2 transition-colors hover:underline",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:no-underline",
        tones[tone],
        className,
      )}
      {...rest}
    />
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin text-current", className || "h-4 w-4")}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* Panels & toolbars                                                           */
/* -------------------------------------------------------------------------- */

export function Panel({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function PanelHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Filter / search strip that sits directly above a table. */
export function Toolbar({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/60 px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900",
          "placeholder:text-slate-400",
          "focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200",
        )}
      />
    </div>
  )
}

export function Select({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  /** Visually hidden label — always give selects an accessible name. */
  label: string
  className?: string
}) {
  return (
    <label className={cn("relative inline-flex", className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700",
          "focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" />
      </svg>
    </label>
  )
}

/* -------------------------------------------------------------------------- */
/* Tabs & segmented filters                                                    */
/* -------------------------------------------------------------------------- */

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  actions,
  className,
}: {
  tabs: { key: T; label: string; count?: number; tone?: Tone }[]
  value: T
  onChange: (key: T) => void
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center gap-1 border-b border-slate-200",
        className,
      )}
      role="tablist"
    >
      {tabs.map((t) => {
        const active = t.key === value
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200",
              active
                ? "border-warning text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800",
            )}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                  active
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        )
      })}
      {actions && <div className="ml-auto pb-2">{actions}</div>}
    </div>
  )
}

/**
 * Clickable metric chips that double as filters — the pattern used on
 * Subscriptions. Selecting one filters the table below it.
 */
export function FilterCards<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: { key: T; label: string; count: number; tone?: Tone }[]
  value: T
  onChange: (key: T) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.key === value
        const tone = item.tone || "neutral"
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.key)}
            className={cn(
              "rounded-xl border bg-white p-3.5 text-left transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200",
              active
                ? "border-slate-900/10 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-2 ring-warning/60"
                : "border-slate-200 hover:border-slate-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", DOT_TONES[tone])} />
              <span className="text-xs font-medium text-slate-500">
                {item.label}
              </span>
            </div>
            <div className="mt-1.5 text-2xl font-semibold tabular-nums text-slate-900">
              {item.count.toLocaleString()}
            </div>
          </button>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Status pill / badges                                                        */
/* -------------------------------------------------------------------------- */

export function StatusPill({
  tone = "neutral",
  dot = true,
  children,
  className,
}: {
  tone?: Tone
  dot?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset",
        PILL_TONES[tone],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", DOT_TONES[tone])} />}
      {children}
    </span>
  )
}

/** Neutral, squared-off tag for non-status metadata (plans, types, gateways). */
export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        PILL_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Stat cards                                                                  */
/* -------------------------------------------------------------------------- */

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "neutral",
  onClick,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  hint?: React.ReactNode
  tone?: Tone
  onClick?: () => void
}) {
  const interactive = typeof onClick === "function"
  const Wrapper: any = interactive ? "button" : "div"
  return (
    <Wrapper
      {...(interactive ? { type: "button", onClick } : {})}
      className={cn(
        "group flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left",
        "shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all",
        interactive &&
          "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200",
      )}
    >
      {icon && (
        <span
          className={cn(
            "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
            PILL_TONES[tone],
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>
        <span className="mt-1 block text-2xl font-semibold tabular-nums leading-none text-slate-900">
          {value}
        </span>
        {hint && (
          <span className="mt-1.5 block text-xs text-slate-400">{hint}</span>
        )}
      </span>
      {interactive && (
        <svg
          className="mt-1 h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" strokeLinecap="round" />
        </svg>
      )}
    </Wrapper>
  )
}

/* -------------------------------------------------------------------------- */
/* Data table                                                                  */
/* -------------------------------------------------------------------------- */

export function Table({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full text-sm", className)}>{children}</table>
    </div>
  )
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50">{children}</thead>
  )
}

export function Th({
  children,
  align = "left",
  className,
}: {
  children?: React.ReactNode
  align?: "left" | "right" | "center"
  className?: string
}) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
        className,
      )}
    >
      {children}
    </th>
  )
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>
}

export function Tr({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("transition-colors hover:bg-slate-50/80", className)} {...rest}>
      {children}
    </tr>
  )
}

export function Td({
  children,
  align = "left",
  className,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "right" | "center"
}) {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle text-slate-700",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  )
}

/** Two-line identity cell: strong primary label with muted secondary line. */
export function CellStack({
  primary,
  secondary,
  badge,
}: {
  primary: React.ReactNode
  secondary?: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="truncate font-medium text-slate-900">{primary}</span>
        {badge}
      </div>
      {secondary && (
        <div className="truncate text-xs text-slate-500">{secondary}</div>
      )}
    </div>
  )
}

/** Muted placeholder for missing values — never leave a cell blank. */
export function Empty() {
  return <span className="text-slate-300">—</span>
}

/* -------------------------------------------------------------------------- */
/* Loading & empty states                                                      */
/* -------------------------------------------------------------------------- */

export function TableSkeleton({
  rows = 6,
  cols = 5,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div className="divide-y divide-slate-100" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((__, c) => (
            <div
              key={c}
              className="h-3 animate-pulse rounded bg-slate-100"
              style={{ width: c === 0 ? "22%" : `${Math.max(8, 60 / cols)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[86px] animate-pulse rounded-xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("px-6 py-16 text-center", className)}>
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

/** Inline explanatory / warning banner. */
export function Callout({
  tone = "info",
  title,
  children,
  icon,
  className,
}: {
  tone?: Tone
  title?: React.ReactNode
  children?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}) {
  const tones: Record<Tone, string> = {
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    danger: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-sky-200 bg-sky-50 text-sky-900",
    accent: "border-violet-200 bg-violet-50 text-violet-900",
  }
  return (
    <div className={cn("mb-5 rounded-xl border p-4", tones[tone], className)}>
      <div className="flex gap-3">
        {icon && <span className="mt-0.5 flex-shrink-0">{icon}</span>}
        <div className="min-w-0 text-sm">
          {title && <p className="font-semibold">{title}</p>}
          {children && (
            <div className={cn("leading-relaxed opacity-90", title && "mt-1 text-xs")}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Footer line for tables: "Showing X of Y". */
export function TableFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-500">
      {children}
    </div>
  )
}

/** Section gate shown when an admin lacks the permission for a screen. */
export function NoAccess({
  permission,
  children,
}: {
  permission?: string
  children?: React.ReactNode
}) {
  return (
    <EmptyState
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 1 1 8 0v3" strokeLinecap="round" />
        </svg>
      }
      title="You don't have access to this section"
      description={
        children ||
        `This screen requires the ${permission ? `“${permission}” ` : ""}permission. Ask a super admin if you need it.`
      }
    />
  )
}
