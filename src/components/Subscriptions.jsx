import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AssingProfessional from "./AssingProfessional";
import {
  Panel,
  Toolbar,
  SearchInput,
  Button,
  Table,
  THead,
  TBody,
  Th,
  Tr,
  Td,
  CellStack,
  StatusPill,
  Tag,
  Empty,
  TableSkeleton,
  EmptyState,
  TableFooter,
  FilterCards,
} from "@/components/ui/admin-kit";

const STATUS_LABELS = {
  active: { label: "Active", tone: "success" },
  trialing: { label: "Trialing", tone: "info" },
  past_due: { label: "Past due", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "danger" },
  expired: { label: "Expired", tone: "neutral" },
};

const GATEWAY_LABELS = {
  stripe: "Stripe",
  paystack: "Paystack",
  wallet: "Wallet",
};

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const Subscriptions = ({ users }) => {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  const getAuthor = (id) => {
    if (!id) return null;
    const user = (users || []).find((u) => u._id === id);
    return user?.name || id;
  };

  const getSub = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "/admin/subscriptions/unassigned?page=1&limit=100",
      );
      setSubs(res.data?.data?.subscriptions || res.data?.subscriptions || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSub();
  }, []);

  /** Status can come from `status` or the legacy `expired`/`grace` booleans. */
  const statusOf = (sub) => {
    const raw = String(sub.status || "").toLowerCase();
    if (raw) return raw;
    if (sub.expired) return "expired";
    if (sub.grace) return "past_due";
    return "active";
  };

  const counts = useMemo(
    () => ({
      all: subs.length,
      active: subs.filter((s) => statusOf(s) === "active" && !s.expired).length,
      past_due: subs.filter((s) => statusOf(s) === "past_due" || s.grace).length,
      expired: subs.filter((s) => statusOf(s) === "expired" || s.expired).length,
      cancelled: subs.filter((s) => statusOf(s) === "cancelled").length,
    }),
    [subs],
  );

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    return subs.filter((sub) => {
      const status = statusOf(sub);
      if (filter === "expired" && !(status === "expired" || sub.expired))
        return false;
      if (filter === "past_due" && !(status === "past_due" || sub.grace))
        return false;
      if (
        filter !== "all" &&
        filter !== "expired" &&
        filter !== "past_due" &&
        status !== filter
      )
        return false;
      if (q) {
        const org = getAuthor(sub.author);
        const haystack = [org, sub.planType, sub.duration, sub.gateway]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        if (!haystack.some((v) => v.includes(q))) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subs, filter, searchValue, users]);

  const filtersActive = Boolean(searchValue) || filter !== "all";

  return (
    <>
      <FilterCards
        items={[
          { key: "all", label: "All subscriptions", count: counts.all },
          { key: "active", label: "Active", count: counts.active, tone: "success" },
          { key: "past_due", label: "Past due", count: counts.past_due, tone: "warning" },
          { key: "expired", label: "Expired", count: counts.expired },
          { key: "cancelled", label: "Cancelled", count: counts.cancelled, tone: "danger" },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <Panel>
        <Toolbar>
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search by organisation or plan…"
            className="w-full sm:w-80"
          />
          {filtersActive && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchValue("");
                setFilter("all");
              }}
            >
              Clear filters
            </Button>
          )}
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={getSub}
            loading={loading}
          >
            Refresh
          </Button>
        </Toolbar>

        {loading ? (
          <TableSkeleton rows={6} cols={8} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              filtersActive
                ? "No subscriptions match those filters"
                : "No subscriptions yet"
            }
            description={
              filtersActive
                ? "Try a different status or clear the filters."
                : "Unassigned subscriptions will show up here."
            }
            action={
              filtersActive ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchValue("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <Table>
              <THead>
                <Tr>
                  <Th>Organisation</Th>
                  <Th>Plan</Th>
                  <Th align="right">Amount</Th>
                  <Th>Gateway</Th>
                  <Th>Status</Th>
                  <Th>Next billing</Th>
                  <Th align="right">Assign</Th>
                </Tr>
              </THead>
              <TBody>
                {filtered.map((sub) => {
                  const status = statusOf(sub);
                  const meta = STATUS_LABELS[status] || {
                    label: status || "Unknown",
                    tone: "neutral",
                  };
                  const gateway = String(sub.gateway || "wallet").toLowerCase();
                  const planType = sub.planType
                    ? sub.planType.charAt(0).toUpperCase() + sub.planType.slice(1)
                    : sub.duration;
                  const started = formatDate(sub.createdAt);
                  const nextBilling = formatDate(sub.nextBillingDate);
                  const graceEnds = formatDate(sub.graceExpiresAt);

                  return (
                    <Tr key={sub._id}>
                      <Td>
                        <CellStack
                          primary={getAuthor(sub.author) || "Unknown"}
                          secondary={started ? `Started ${started}` : null}
                        />
                      </Td>
                      <Td>{planType ? <Tag>{planType}</Tag> : <Empty />}</Td>
                      <Td align="right">
                        <span className="font-semibold tabular-nums text-slate-900">
                          {sub.currency || "$"}
                          {Number(sub.amount || 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400">/mo</span>
                      </Td>
                      <Td>
                        <span className="text-slate-600">
                          {GATEWAY_LABELS[gateway] || gateway}
                        </span>
                      </Td>
                      <Td>
                        {/* Grace period shown next to status rather than in its own
                            column — it's a qualifier on the status, not separate data. */}
                        <div className="flex flex-col items-start gap-1">
                          <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                          {sub.grace && (
                            <span className="text-[11px] text-amber-600">
                              In grace{graceEnds ? ` until ${graceEnds}` : ""}
                            </span>
                          )}
                        </div>
                      </Td>
                      <Td>{nextBilling || <Empty />}</Td>
                      <Td align="right">
                        <AssingProfessional
                          users={users}
                          sub={sub}
                          getSub={() => getSub()}
                        />
                      </Td>
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
            <TableFooter>
              <span>
                Showing {filtered.length} of {subs.length}
              </span>
            </TableFooter>
          </>
        )}
      </Panel>
    </>
  );
};

export default Subscriptions;
