import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { adminApi } from "@/lib/adminApi";
import MessageModal from "./MessageModal";
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

const PROFESSIONS = [
  "General Administrative Assistant",
  "Social Media Manager",
  "Real Estate",
  "Virtual Research",
  "Virtual Data Entry",
  "Virtual Book keeper",
  "Virtual ecommerce",
  "Customer Service Provider (Phone/Chat)",
  "Content Writer",
  "Website Management",
  "Public Relation Assistant",
  "Graphic designs",
  "Appointment/Calendar setter",
  "Email Management",
  "Campaign/petition Writer",
];

const ROLES = [
  { value: "All", label: "All account types" },
  { value: "Professional", label: "Professional / VA" },
  { value: "Organization", label: "Organization" },
  { value: "Admin", label: "Admin" },
  { value: "Editor", label: "Editor" },
];

const PUBLIC_SITE = "https://www.theplaint.org";

/** Profession can arrive as a string or an array of `{ name }`. */
const professionText = (profession) => {
  if (!profession) return "";
  if (Array.isArray(profession)) {
    return profession.map((p) => p?.name).filter(Boolean).join(", ");
  }
  return String(profession);
};

const idOf = (user) => String(user?._id || user?.id || user?.email || "");

const User = () => {
  const [users, setUsers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(false);

  // Filters
  const [searchValue, setSearchValue] = useState("");
  const [role, setRole] = useState("All");
  const [professionValue, setProfessionValue] = useState("All");
  const [country, setCountry] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selection is held as a Set of ids. The previous version pushed directly
  // into a state array, which mutated it in place and never re-rendered, so
  // the checkboxes and bulk actions silently disagreed.
  const [selected, setSelected] = useState(() => new Set());

  const load = async () => {
    setLoading(true);
    try {
      const result = await adminApi.users({
        page: pagination.page,
        limit: pagination.limit,
        search: searchValue,
        status: statusFilter,
        accountType: role,
        country,
        profession: professionValue,
      });
      setUsers(result.users || []);
      setPagination(result.pagination);
      setSelected(new Set());
    } catch (err) {
      console.log(err);
      setNotice({ tone: "danger", text: "Couldn't load the member directory. Try refreshing." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, searchValue, statusFilter, role, country, professionValue]);

  useEffect(() => {
    axios
      .get(window.location.origin + "/api/getCountries")
      .then((res) => {
        const list = (res.data || []).map((c) => ({ label: c, value: c }));
        setCountries([{ value: "All", label: "All countries" }, ...list]);
      })
      .catch((err) => console.log(err));
  }, []);

  const counts = useMemo(
    () => ({
      all: users.length,
      active: users.filter((u) => u.isActive).length,
      blocked: users.filter((u) => !u.isActive).length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    const q = searchValue.trim().toLowerCase();

    return users.filter((user) => {
      if (q) {
        const haystack = [user.name, user.email, professionText(user.profession)]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        if (!haystack.some((v) => v.includes(q))) return false;
      }

      if (statusFilter === "active" && !user.isActive) return false;
      if (statusFilter === "blocked" && user.isActive) return false;

      if (role !== "All" && (user.accountType || user.role) !== role) return false;

      if (professionValue !== "All") {
        if (Array.isArray(user.profession)) {
          if (!user.profession.some((p) => p?.name === professionValue)) return false;
        } else if (user.profession !== professionValue) {
          return false;
        }
      }

      if (country !== "All" && user.country !== country) return false;

      return true;
    });
  }, [users, searchValue, role, professionValue, country, statusFilter]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((u) => selected.has(idOf(u)));

  const toggleAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filtered.forEach((u) => next.delete(idOf(u)));
      } else {
        filtered.forEach((u) => next.add(idOf(u)));
      }
      return next;
    });
  };

  const toggleOne = (user) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const key = idOf(user);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const setActive = async (ids, isActive) => {
    if (ids.length === 0) return;
    setWorking(true);
    setNotice(null);
    try {
      // Awaited together so feedback reflects the real outcome. The previous
      // version fired `.map(async …)` and alerted before any request settled.
      const results = await Promise.allSettled(
        ids.map((id) => axios.put(`/user/single/${id}`, { isActive })),
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const verb = isActive ? "activated" : "blocked";

      setNotice(
        failed
          ? {
              tone: "warning",
              text: `${ids.length - failed} of ${ids.length} ${verb}. ${failed} failed — try those again.`,
            }
          : {
              tone: "success",
              text: `${ids.length} ${ids.length === 1 ? "account" : "accounts"} ${verb}.`,
            },
      );
      await load();
    } catch (e) {
      console.log(e);
      setNotice({ tone: "danger", text: "That action didn't go through." });
    } finally {
      setWorking(false);
    }
  };

  const selectedIds = useMemo(() => Array.from(selected), [selected]);
  const hasSelection = selectedIds.length > 0;
  const filtersActive =
    Boolean(searchValue) ||
    role !== "All" ||
    professionValue !== "All" ||
    country !== "All" ||
    statusFilter !== "all";

  const clearFilters = () => {
    setSearchValue("");
    setRole("All");
    setProfessionValue("All");
    setCountry("All");
    setStatusFilter("all");
  };

  return (
    <>
      <FilterCards
        items={[
          { key: "all", label: "All members", count: counts.all },
          { key: "active", label: "Active", count: counts.active, tone: "success" },
          { key: "blocked", label: "Blocked", count: counts.blocked, tone: "danger" },
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
            placeholder="Search by name, email or profession…"
            className="w-full sm:w-80"
          />
          <Select
            label="Account type"
            value={role}
            onChange={setRole}
            options={ROLES}
          />
          <Select
            label="Profession"
            value={professionValue}
            onChange={setProfessionValue}
            options={[
              { value: "All", label: "All professions" },
              ...PROFESSIONS.map((p) => ({ value: p, label: p })),
            ]}
          />
          {countries.length > 0 && (
            <Select
              label="Country"
              value={country}
              onChange={setCountry}
              options={countries}
            />
          )}
          {filtersActive && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </Toolbar>

        {/* Bulk actions only appear once something is selected, so the default
            toolbar stays quiet instead of offering buttons that do nothing. */}
        {hasSelection && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-2.5">
            <span className="text-xs font-medium text-slate-600">
              {selectedIds.length} selected
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                loading={working}
                onClick={() => setActive(selectedIds, true)}
              >
                Activate
              </Button>
              <Button
                variant="danger"
                loading={working}
                onClick={() => setActive(selectedIds, false)}
              >
                Block
              </Button>
              <Button variant="secondary" onClick={() => setModal(true)}>
                Message
              </Button>
              <Button variant="ghost" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filtersActive ? "No members match those filters" : "No members yet"}
            description={
              filtersActive
                ? "Try widening your search or clearing the filters."
                : "Accounts will appear here as people sign up."
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
                  <Th>
                    <input
                      type="checkbox"
                      aria-label="Select all visible members"
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900/20"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                    />
                  </Th>
                  <Th>Member</Th>
                  <Th>Account type</Th>
                  <Th>Profession</Th>
                  <Th>Status</Th>
                  <Th>Location</Th>
                  <Th align="right">Actions</Th>
                </Tr>
              </THead>
              <TBody>
                {filtered.map((user) => {
                  const key = idOf(user);
                  const profession = professionText(user.profession);
                  const location = [user.city, user.country].filter(Boolean).join(", ");

                  return (
                    <Tr key={key}>
                      <Td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${user.name || "member"}`}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900/20"
                          checked={selected.has(key)}
                          onChange={() => toggleOne(user)}
                        />
                      </Td>
                      <Td>
                        <CellStack
                          primary={
                            <a
                              className="hover:underline"
                              href={`${PUBLIC_SITE}/user?page=${user?._id}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {user?.name || "Unnamed"}
                            </a>
                          }
                          secondary={user?.email}
                        />
                      </Td>
                      <Td>
                        {user?.accountType || user?.role ? (
                          <Tag>{user.accountType || user.role}</Tag>
                        ) : (
                          <Empty />
                        )}
                      </Td>
                      <Td>{profession || <Empty />}</Td>
                      <Td>
                        <StatusPill tone={user?.isActive ? "success" : "danger"}>
                          {user?.isActive ? "Active" : "Blocked"}
                        </StatusPill>
                      </Td>
                      <Td>{location || <Empty />}</Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-1">
                          <RowAction
                            href={`${PUBLIC_SITE}/messages?page=${user?._id}`}

                            target="_blank"
                            rel="noreferrer"
                          >
                            Message
                          </RowAction>
                          {/* One explicit action per row rather than the old
                              Block/Activate pair that both just toggled. */}
                          <RowAction
                            tone={user?.isActive ? "danger" : "success"}
                            disabled={working}
                            onClick={() => setActive([key], !user?.isActive)}
                          >
                            {user?.isActive ? "Block" : "Activate"}
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
                Showing {filtered.length} of {pagination.total}
              </span>
              {hasSelection && <span>{selectedIds.length} selected</span>}
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" disabled={pagination.page <= 1 || loading} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>Previous</Button>
                <span>Page {pagination.page} of {pagination.pages}</span>
                <Button variant="ghost" disabled={pagination.page >= pagination.pages || loading} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>Next</Button>
              </div>
            </TableFooter>
          </>
        )}
      </Panel>

      <MessageModal open={modal} handleClose={() => setModal(false)} />
    </>
  );
};

export default User;
