import React from "react";
import {
  StatCard,
  Panel,
  PanelHeader,
  EmptyState,
  CardsSkeleton,
  Tag,
} from "@/components/ui/admin-kit";

/**
 * Dashboard overview.
 *
 * The previous version stacked six identical gold cards reading "Total Number
 * Of …", which gave every metric the same weight and no way to tell healthy
 * from urgent. Now metrics are split into two scannable groups — Audience and
 * Content — each card is a shortcut into the section that owns that number,
 * and content totals roll up so the top line answers "how much is on the
 * platform?" without mental arithmetic.
 */

const icon = (path) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    {path}
  </svg>
);

const ICONS = {
  users: icon(
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 20a6 6 0 0 0-3-5.2" />
    </>,
  ),
  orgs: icon(
    <>
      <rect x="3" y="8" width="8" height="12" rx="1.5" />
      <rect x="13" y="4" width="8" height="16" rx="1.5" />
      <path d="M6 12h2M6 16h2M16 8h2M16 12h2M16 16h2" />
    </>,
  ),
  petitions: icon(
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M9 12h7M9 16h4" />
    </>,
  ),
  posts: icon(
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9h10M7 13h6" />
    </>,
  ),
  adverts: icon(
    <>
      <path d="M4 10v4a1 1 0 0 0 1 1h3l5 4V5L8 9H5a1 1 0 0 0-1 1Z" />
      <path d="M17 9a4 4 0 0 1 0 6" />
    </>,
  ),
  events: icon(
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </>,
  ),
  victories: icon(
    <>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M12 12v4M9 20h6M8 5H5a3 3 0 0 0 3 3M16 5h3a3 3 0 0 1-3 3" />
    </>,
  ),
  updates: icon(
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
      <path d="M20.5 4v5h-5" />
    </>,
  ),
};

const Summary = ({ summary = {}, users = [], loading, onNavigate }) => {
  const n = (v) => Number(v || 0);

  const contentTotal =
    n(summary.posts) +
    n(summary.petitions) +
    n(summary.adverts) +
    n(summary.events) +
    n(summary.victories) +
    n(summary.updates);

  const go = (key) => (onNavigate ? () => onNavigate(key) : undefined);

  const audience = [
    {
      label: "Users",
      value: n(summary.users).toLocaleString(),
      icon: ICONS.users,
      tone: "info",
      hint: "Individual members",
      onClick: go("user"),
    },
    {
      label: "Organisations",
      value: n(summary.orgs).toLocaleString(),
      icon: ICONS.orgs,
      tone: "accent",
      hint: "Registered bodies",
      onClick: go("user"),
    },
  ];

  const content = [
    { label: "Petitions", value: n(summary.petitions), icon: ICONS.petitions, tone: "warning" },
    { label: "Posts", value: n(summary.posts), icon: ICONS.posts, tone: "neutral" },
    { label: "Events", value: n(summary.events), icon: ICONS.events, tone: "info" },
    { label: "Adverts", value: n(summary.adverts), icon: ICONS.adverts, tone: "accent" },
    { label: "Victories", value: n(summary.victories), icon: ICONS.victories, tone: "success" },
    { label: "Updates", value: n(summary.updates), icon: ICONS.updates, tone: "neutral" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <CardsSkeleton count={3} />
        <CardsSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Audience */}
      <section aria-labelledby="audience-heading">
        <h2
          id="audience-heading"
          className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
        >
          Audience
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audience.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
          <StatCard
            label="Total content"
            value={contentTotal.toLocaleString()}
            icon={ICONS.posts}
            tone="success"
            hint="All published items combined"
            onClick={go("content")}
          />
        </div>
      </section>

      {/* Content breakdown */}
      <section aria-labelledby="content-heading">
        <div className="mb-3 flex items-center gap-2">
          <h2
            id="content-heading"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Content
          </h2>
          <Tag tone="neutral">{contentTotal.toLocaleString()} items</Tag>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {content.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={go("content")}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              <span className="flex items-center gap-2 text-slate-400 transition-colors group-hover:text-slate-600">
                {item.icon}
                <span className="truncate text-xs font-medium text-slate-500">
                  {item.label}
                </span>
              </span>
              <span className="mt-2 block text-2xl font-semibold tabular-nums leading-none text-slate-900">
                {item.value.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Activity */}
      <Panel>
        <PanelHeader
          title="Recent activity"
          description="Admin actions and platform events, newest first."
        />
        <EmptyState
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="h-6 w-6"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          }
          title="No activity yet"
          description="Once admins start approving content, resolving reports or processing payouts, the trail shows up here."
        />
      </Panel>
    </div>
  );
};

export default Summary;
