import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Panel,
  Toolbar,
  SearchInput,
  Select,
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
  Callout,
  TableFooter,
} from "@/components/ui/admin-kit";

const STATUSES = ["Pending", "Processed", "Failed", "All"];

const STATUS_TONE = {
  pending: "warning",
  processing: "info",
  processed: "success",
  paid: "success",
  completed: "success",
  failed: "danger",
  rejected: "danger",
};

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/** Payout amounts are money — always grouped, always 2dp. */
const formatAmount = (amount, currency) => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return null;
  const formatted = n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${formatted}` : formatted;
};

/** Axios errors don't always carry a response (network/timeout). */
const errorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const Withdrawal = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  // Tracked per-id so only the row being processed shows a spinner. The old
  // single boolean made every button in the table read "Processing…".
  const [working, setWorking] = useState(null);
  const [status, setStatus] = useState("Pending");
  const [searchValue, setSearchValue] = useState("");
  // Payouts move real money and can't be undone, so they get a confirm step.
  const [confirming, setConfirming] = useState(null);

  const getAll = async (nextStatus = status) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: "1", limit: "100" });
      if (nextStatus !== "All") query.set("status", nextStatus);
      const res = await axios.get(`/admin/withdrawals?${query.toString()}`);
      setRequests(res.data?.withdrawals || []);
    } catch (err) {
      console.log(err);
      toast.error(errorMessage(err, "Couldn't load withdrawal requests."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAll(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (!confirming) return;
    const onKey = (e) => {
      if (e.key === "Escape") setConfirming(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirming]);

  const process = async (request) => {
    const id = request?._id;
    if (!id) return;
    setWorking(id);
    try {
      await axios.post(`/admin/withdrawals/${id}/process`);
      toast.success("Withdrawal processed.");
      setConfirming(null);
      await getAll();
    } catch (err) {
      console.log(err);
      toast.error(errorMessage(err, "Couldn't process that withdrawal."));
    } finally {
      setWorking(null);
    }
  };

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) =>
      [r.account_name, r.account_bank, r.account_number, r.provider]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [requests, searchValue]);

  const pendingTotal = useMemo(
    () =>
      requests.reduce((sum, r) => {
        const n = Number(r.amount);
        return Number.isFinite(n) ? sum + n : sum;
      }, 0),
    [requests],
  );

  return (
    <>
      {/* Payout queues benefit from a running total: it tells the admin how much
          money is waiting before they start approving one by one. */}
      {status === "Pending" && requests.length > 0 && (
        <Callout tone="warning" className="mb-4">
          <span className="font-semibold">
            {requests.length} pending {requests.length === 1 ? "payout" : "payouts"}
          </span>{" "}
          totalling {formatAmount(pendingTotal, requests[0]?.currency)}. Processing
          sends funds immediately and can't be undone.
        </Callout>
      )}

      <Panel>
        <Toolbar>
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search by account name, bank or number…"
            className="w-full sm:w-80"
          />
          <Select
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUSES.map((s) => ({
              value: s,
              label: s === "All" ? "All statuses" : s,
            }))}
          />
          <Button
            variant="ghost"
            className="ml-auto"
            onClick={() => getAll()}
            loading={loading}
          >
            Refresh
          </Button>
        </Toolbar>

        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              searchValue
                ? "No requests match that search"
                : status === "Pending"
                  ? "No payouts waiting"
                  : `No ${status.toLowerCase()} withdrawals`
            }
            description={
              searchValue
                ? "Try a different account name or bank."
                : "Withdrawal requests will appear here as members submit them."
            }
            action={
              searchValue ? (
                <Button variant="secondary" onClick={() => setSearchValue("")}>
                  Clear search
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <Table>
              <THead>
                <Tr>
                  <Th>Requested</Th>
                  <Th align="right">Amount</Th>
                  <Th>Recipient</Th>
                  <Th>Account number</Th>
                  <Th>Provider</Th>
                  <Th>Status</Th>
                  <Th align="right">Actions</Th>
                </Tr>
              </THead>
              <TBody>
                {filtered.map((request) => {
                  const state = String(request.status || "Pending");
                  const tone = STATUS_TONE[state.toLowerCase()] || "neutral";
                  const settled = tone === "success";
                  const amount = formatAmount(request.amount, request.currency);

                  return (
                    <Tr key={request._id}>
                      <Td>{formatDate(request.createdAt) || <Empty />}</Td>
                      <Td align="right">
                        <span className="font-semibold tabular-nums text-slate-900">
                          {amount || <Empty />}
                        </span>
                      </Td>
                      <Td>
                        <CellStack
                          primary={request.account_name || "Unknown"}
                          secondary={request.account_bank}
                        />
                      </Td>
                      <Td>
                        {request.account_number ? (
                          <span className="font-mono text-xs tabular-nums text-slate-700">
                            {request.account_number}
                          </span>
                        ) : (
                          <Empty />
                        )}
                      </Td>
                      <Td>
                        {request.provider ? <Tag>{request.provider}</Tag> : <Empty />}
                      </Td>
                      <Td>
                        <StatusPill tone={tone}>{state}</StatusPill>
                      </Td>
                      <Td align="right">
                        {settled ? (
                          <span className="text-xs text-slate-400">
                            No action needed
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            loading={working === request._id}
                            onClick={() => setConfirming(request)}
                          >
                            Process
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
            <TableFooter>
              <span>
                Showing {filtered.length} of {requests.length}
              </span>
              <span className="font-medium text-slate-600">
                Total {formatAmount(pendingTotal, requests[0]?.currency)}
              </span>
            </TableFooter>
          </>
        )}
      </Panel>

      {/* Confirmation restates the exact amount and destination account so the
          admin can catch a mis-click before funds leave. */}
      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payout-dialog-title"
        >
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setConfirming(null)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2
                id="payout-dialog-title"
                className="text-sm font-semibold text-slate-900"
              >
                Process this payout?
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Funds are sent immediately. This can't be reversed.
              </p>
            </div>

            <dl className="divide-y divide-slate-100 px-5 py-2 text-sm">
              {[
                {
                  label: "Amount",
                  value: formatAmount(confirming.amount, confirming.currency),
                  strong: true,
                },
                { label: "Account name", value: confirming.account_name },
                { label: "Bank", value: confirming.account_bank },
                { label: "Account number", value: confirming.account_number },
                { label: "Provider", value: confirming.provider },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-slate-500">{row.label}</dt>
                  <dd
                    className={
                      row.strong
                        ? "font-semibold tabular-nums text-slate-900"
                        : "text-right text-slate-800"
                    }
                  >
                    {row.value || <Empty />}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3">
              <Button variant="ghost" onClick={() => setConfirming(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={working === confirming._id}
                onClick={() => process(confirming)}
              >
                Send payout
              </Button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" hideProgressBar theme="light" />
    </>
  );
};

export default Withdrawal;
