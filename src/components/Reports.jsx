import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Panel,
  Toolbar,
  SearchInput,
  Select,
  Button,
  RowAction,
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
  FilterCards,
} from "@/components/ui/admin-kit";

const PUBLIC_SITE = "https://www.theplaint.org";

const ITEM_TYPES = [
  "User",
  "Petition",
  "Post",
  "Event",
  "Advert",
  "Victory",
  "Update",
];

/** Dates arrive as ISO strings, but can be missing on older records. */
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

/** Petitions live under /campaigns/:id; everything else uses ?page=:id. */
const targetUrl = (report) => {
  if (!report?.itemId || !report?.itemType) return null;
  if (report.itemType === "Petition") {
    return `${PUBLIC_SITE}/campaigns/${report.itemId}`;
  }
  return `${PUBLIC_SITE}/${report.itemType}?page=${report.itemId}`;
};

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(null);
  const [notice, setNotice] = useState(null);

  const [searchValue, setSearchValue] = useState("");
  const [itemType, setItemType] = useState("All");
  const [statusFilter, setStatusFilter] = useState("open");

  // The report being previewed in the detail dialog.
  const [active, setActive] = useState(null);

  const getReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/reports");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data?.reports || [];
      setReports(data);
    } catch (err) {
      console.log(err);
      setNotice({ tone: "danger", text: "Couldn't load reports. Try refreshing." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReports();
  }, []);

  // Escape closes the detail dialog — expected behaviour for any overlay.
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  const toggleResolved = async (report) => {
    const id = report?._id;
    if (!id) return;
    setWorking(id);
    setNotice(null);
    try {
      await axios.post(`/report/${id}`, { resolved: !report.resolved });
      setNotice({
        tone: "success",
        text: report.resolved
          ? "Report reopened."
          : "Report marked resolved.",
      });
      setActive(null);
      await getReports();
    } catch (err) {
      console.log(err);
      setNotice({ tone: "danger", text: "Couldn't update that report." });
    } finally {
      setWorking(null);
    }
  };

  const counts = useMemo(
    () => ({
      all: reports.length,
      open: reports.filter((r) => !r.resolved).length,
      resolved: reports.filter((r) => r.resolved).length,
    }),
    [reports],
  );

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    return reports.filter((report) => {
      if (statusFilter === "open" && report.resolved) return false;
      if (statusFilter === "resolved" && !report.resolved) return false;
      if (itemType !== "All" && report.itemType !== itemType) return false;
      if (q) {
        const haystack = [report.authorName, report.body, report.itemType]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        if (!haystack.some((v) => v.includes(q))) return false;
      }
      return true;
    });
  }, [reports, searchValue, itemType, statusFilter]);

  const filtersActive =
    Boolean(searchValue) || itemType !== "All" || statusFilter !== "open";

  const clearFilters = () => {
    setSearchValue("");
    setItemType("All");
    setStatusFilter("open");
  };

  return (
    <>
      {/* Defaults to "Open" so the queue that needs action is what admins land on. */}
      <FilterCards
        items={[
          { key: "open", label: "Needs review", count: counts.open, tone: "warning" },
          { key: "resolved", label: "Resolved", count: counts.resolved, tone: "success" },
          { key: "all", label: "All reports", count: counts.all },
        ]}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      {notice && (
        <Callout tone={notice.tone} className="mb-4">
          {notice.text}
        </Callout>
      )}

      <Panel>
        <Toolbar>
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search reports by author or content…"
            className="w-full sm:w-80"
          />
          <Select
            label="Reported item type"
            value={itemType}
            onChange={setItemType}
            options={[
              { value: "All", label: "All item types" },
              ...ITEM_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />
          {filtersActive && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </Toolbar>

        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              filtersActive
                ? "No reports match those filters"
                : "Nothing needs review"
            }
            description={
              filtersActive
                ? "Try a different item type or clear the filters."
                : "New reports from the community will land here."
            }
            action={
              filtersActive ? (
                <Button variant="secondary" onClick={clearFilters}>
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
                  <Th>Reported by</Th>
                  <Th>Type</Th>
                  <Th>Report</Th>
                  <Th>Status</Th>
                  <Th align="right">Actions</Th>
                </Tr>
              </THead>
              <TBody>
                {filtered.map((report) => {
                  const date = formatDate(report.createdAt);
                  const url = targetUrl(report);
                  const busy = working === report._id;

                  return (
                    <Tr key={report._id}>
                      <Td>
                        <CellStack
                          primary={report.authorName || "Unknown"}
                          secondary={date || "Date unknown"}
                        />
                      </Td>
                      <Td>
                        {report.itemType ? <Tag>{report.itemType}</Tag> : <Empty />}
                      </Td>
                      <Td>
                        {/* The full text opens in a dialog; the cell stays one line
                            so rows keep a scannable height. */}
                        <button
                          type="button"
                          onClick={() => setActive(report)}
                          className="max-w-md truncate text-left text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
                        >
                          {report.body || "View report"}
                        </button>
                      </Td>
                      <Td>
                        {/* Was an unlabelled coloured dot — now readable text. */}
                        <StatusPill tone={report.resolved ? "success" : "warning"}>
                          {report.resolved ? "Resolved" : "Open"}
                        </StatusPill>
                      </Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-1">
                          {url && (
                            <RowAction href={url} target="_blank">
                              View {report.itemType?.toLowerCase()}
                            </RowAction>
                          )}
                          <RowAction
                            tone={report.resolved ? "neutral" : "primary"}
                            disabled={busy}
                            onClick={() => toggleResolved(report)}
                          >
                            {report.resolved ? "Reopen" : "Resolve"}
                          </RowAction>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
            <TableFooter>
              <span>
                Showing {filtered.length} of {reports.length}
              </span>
            </TableFooter>
          </>
        )}
      </Panel>

      {/* Detail dialog. The previous version was a bare absolutely-positioned
          div: no backdrop, no Escape, and it could sit behind other content. */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-dialog-title"
        >
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setActive(null)}
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <h2
                  id="report-dialog-title"
                  className="text-sm font-semibold text-slate-900"
                >
                  Report details
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {active.authorName || "Unknown"}
                  {formatDate(active.createdAt) ? ` · ${formatDate(active.createdAt)}` : ""}
                </p>
              </div>
              <StatusPill tone={active.resolved ? "success" : "warning"}>
                {active.resolved ? "Resolved" : "Open"}
              </StatusPill>
            </div>

            <div className="max-h-[50vh] overflow-y-auto px-5 py-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {active.body || "No details were provided."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3">
              <Button variant="ghost" onClick={() => setActive(null)}>
                Close
              </Button>
              {targetUrl(active) && (
                <a href={targetUrl(active)} target="_blank" rel="noreferrer">
                  <Button variant="secondary">
                    View {active.itemType?.toLowerCase()}
                  </Button>
                </a>
              )}
              <Button
                variant={active.resolved ? "secondary" : "primary"}
                loading={working === active._id}
                onClick={() => toggleResolved(active)}
              >
                {active.resolved ? "Reopen report" : "Mark resolved"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Reports;
