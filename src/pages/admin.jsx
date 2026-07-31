import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { getCookie } from "cookies-next";
import Summary from "@/components/Summary";
import User from "@/components/User";
import Report from "@/components/Reports";
import Content from "@/components/Content";
import Subscriptions from "@/components/Subscriptions";
import Withdrawal from "@/components/Withdrawal";
import Tasks from "@/components/Tasks";
import HireRequests from "@/components/HireRequests";
import RemovalLogs from "@/components/RemovalLogs";
import Administrators from "@/components/admin/Administrators";
import AdminShell, { NavIcons } from "@/components/admin/AdminShell";
import {
  PageHeader,
  Panel,
  Toolbar,
  SearchInput,
  Select,
  NoAccess,
  TableSkeleton,
} from "@/components/ui/admin-kit";

import { useAdminSession } from "@/hooks/useAdminSession";
import { AdminPermission } from "@/lib/adminPermissions";
import { adminApi } from "@/lib/adminApi";


import { SERVER_URL } from "./_app";

/**
 * Navigation is grouped by the job an admin is doing rather than by the shape
 * of the data. Each entry declares the permission required to see it, so a
 * Support admin never sees Withdrawals and an Analyst never sees
 * Administrators. The backend enforces the same rules on every request — this
 * is purely so people aren't shown doors they can't open.
 *
 * `title`/`description` live here too so every section gets a consistent
 * header without each component re-inventing one.
 */
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      {
        key: "summary",
        label: "Dashboard",
        permission: AdminPermission.DashboardView,
        icon: NavIcons.overview,
        title: "Dashboard",
        description: "Platform health at a glance — growth, content volume and the queues that need attention.",
      },
    ],
  },
  {
    label: "Moderation",
    items: [
      {
        key: "content",
        label: "Content",
        permission: AdminPermission.ContentView,
        icon: NavIcons.content,
        title: "Manage content",
        description: "Review petitions, posts and campaign material before it reaches the public feed.",
      },
      {
        key: "report",
        label: "Reports",
        permission: AdminPermission.ReportsView,
        icon: NavIcons.reports,
        title: "Reports",
        description: "Community reports awaiting a decision, newest first.",
      },
      {
        key: "removal-logs",
        label: "Removal logs",
        permission: AdminPermission.RemovalLogsView,
        icon: NavIcons.trash,
        danger: true,
        title: "Removal logs",
        description: "Every takedown, who performed it and why. This audit trail is append-only.",
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        key: "tasks",
        label: "Tasks",
        permission: AdminPermission.TasksView,
        icon: NavIcons.tasks,
        title: "Manage tasks",
        description: "Work items assigned across the platform and their current state.",
      },
      {
        key: "hire-requests",
        label: "Hire requests",
        permission: AdminPermission.HireRequestsView,
        icon: NavIcons.hire,
        title: "Hire requests",
        description: "Match incoming client requests with the right professional and keep assignments moving.",
      },
    ],
  },
  {
    label: "Revenue",
    items: [
      {
        key: "subscriptions",
        label: "Subscriptions",
        permission: AdminPermission.SubscriptionsView,
        icon: NavIcons.subscriptions,
        title: "Subscriptions",
        description: "Who is on which plan, and what is renewing or lapsing.",
      },
      {
        key: "withdrawal",
        label: "Withdrawals",
        permission: AdminPermission.WithdrawalsView,
        icon: NavIcons.money,
        title: "Withdrawals",
        description: "Payout requests waiting to be processed. Confirm the account details before releasing funds.",
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        key: "user",
        label: "Users",
        permission: AdminPermission.UsersView,
        icon: NavIcons.users,
        title: "Users",
        description: "Search the member directory, inspect an account and act on it.",
      },
      {
        key: "administrators",
        label: "Administrators",
        permission: AdminPermission.AdminsView,
        icon: NavIcons.shield,
        title: "Administrators",
        description: "Control who can access the admin console and exactly what they can do.",
      },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const CONTENT_TYPES = [
  { value: "petition", label: "Petitions" },
  { value: "post", label: "Posts" },
  { value: "event", label: "Events" },
  { value: "advert", label: "Adverts" },
  { value: "victory", label: "Victories" },
  { value: "update", label: "Updates" },
];

export default function Home() {
  const [active, setActive] = useState("summary");
  const { admin, can, loading: sessionLoading } = useAdminSession();
  const router = useRouter();
  const { query } = router;

  const [counts, setCounts] = useState({
    users: 0,
    orgs: 0,
    posts: 0,
    petitions: 0,
    adverts: 0,
    events: 0,
    victories: 0,
    updates: 0,
  });
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [contents, setContents] = useState([]);
  const [manage, setManage] = useState("petition");
  const [contentSearch, setContentSearch] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  const contentKeyMap = {
    petition: "petitions",
    post: "posts",
    event: "events",
    advert: "adverts",
    victory: "victories",
    update: "updates",
  };

  // Guard: the shell replaces the old FrontLayout wrapper, so the token check
  // lives here now.
  useEffect(() => {
    const token = getCookie("token") ?? localStorage.getItem("token");
    if (!token) window.location.href = "/";
  }, []);

  useEffect(() => {
    if (query.page !== undefined) setActive(query.page);
  }, [query.page]);

  const currentItem = useMemo(
    () => ALL_ITEMS.find((i) => i.key === active),
    [active],
  );

  // `/api/admin/me` already returns a display-ready `roleLabel`; only fall back
  // to deriving one if an older backend response omits it.
  const adminIdentity = useMemo(
    () =>
      admin
        ? {
            name: admin.name,
            email: admin.email,
            roleLabel:
              admin.roleLabel ||
              (admin.isSuperAdmin ? "Super Admin" : "Admin"),
          }
        : null,
    [admin],
  );


  // Only render nav groups this admin can actually use; drop empty groups.
  const visibleGroups = useMemo(
    () =>
      NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => can(item.permission)),
      })).filter((group) => group.items.length > 0),
    [can],
  );

  const navigate = (key) => {
    setActive(key);
    router.push(`?page=${key}`, undefined, { shallow: true });
  };

  const signOut = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/";
  };

  const editItem = async (id, status) => {
    try {
      if (manage !== "petition") {
        alert("Content moderation is only wired for petitions right now.");
        return;
      }
      await axios.post("/petition/approve", { Petition_id: id });
      alert(`petition is ${status}`);
      await loadDashboardData();
    } catch (e) {
      console.log(e);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      let stats;
      try {
        stats = await adminApi.dashboard();
      } catch (dashboardError) {
        if (![404, 502].includes(dashboardError?.status)) throw dashboardError;
        // Compatibility fallback for an API instance being upgraded ahead of
        // the admin web deployment.
        const [usersRes, orgsRes, generalRes] = await Promise.all([
          axios.get("/user"),
          axios.get("/organization"),
          axios.post(`${SERVER_URL}/graphql`, {
            query: `query DashboardFallback { general {
              posts { _id } petitions { _id } events { _id }
              adverts { _id } victories { _id }
            } }`,
          }),
        ]);
        const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data?.users || [];
        const organisations = Array.isArray(orgsRes.data)
          ? orgsRes.data
          : orgsRes.data?.data?.Organizations || orgsRes.data?.data?.organizations || [];
        const general = generalRes.data?.data?.general || {};
        stats = {
          users: users.length,
          organisations: organisations.length,
          posts: general.posts?.length || 0,
          petitions: general.petitions?.length || 0,
          events: general.events?.length || 0,
          adverts: general.adverts?.length || 0,
          victories: general.victories?.length || 0,
          updates: 0,
        };
      }
      setCounts({
        users: stats.users,
        orgs: stats.organisations,
        posts: stats.posts,
        petitions: stats.petitions,
        adverts: stats.adverts,
        events: stats.events,
        victories: stats.victories,
        updates: stats.updates,
      });
    } catch (err) {
      console.error("Could not load dashboard statistics", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (active === "summary") loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (active !== "content") return;
    let cancelled = false;
    setLoadingData(true);
    const fields = {
      posts: "_id createdAt title name caption body asset { url type } author { _id name image } views likes endorsements",
      petitions: "_id createdAt title name caption body slug status asset { url type } author { _id name image } views numberOfPaidViewsCount numberOfPaidEndorsementCount endorsements",
      events: "_id createdAt name body description asset { url type } author { _id name image }",
      adverts: "_id createdAt caption message body asset { url type } author { _id name image }",
      victories: "_id createdAt body asset { url type } author { _id name image }",
      updates: "_id createdAt body asset { url type } author { _id name image } petition { _id title slug }",
    };
    axios.post(`${SERVER_URL}/graphql`, {
      query: `query AdminContent { general { ${contentKeyMap[manage]} { ${fields[contentKeyMap[manage]]} } } }`,
    }).then((response) => {
      if (cancelled) return;
      const items = response.data?.data?.general?.[contentKeyMap[manage]] || [];
      setContents(items);
    }).catch((error) => {
      if (!cancelled) {
        console.error("Could not load admin content", error);
        setContents([]);
      }
    }).finally(() => {
      if (!cancelled) setLoadingData(false);
    });
    return () => { cancelled = true; };
  }, [active, manage]);

  /**
   * Client-side filter for the content queue so typing narrows results
   * immediately instead of waiting on a round trip.
   */
  const filteredContents = useMemo(() => {
    const q = contentSearch.trim().toLowerCase();
    if (!q) return contents;
    return contents.filter((c) =>
      [c.title, c.name, c.caption, c.body, c.author?.name]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [contents, contentSearch]);

  const renderSection = () => {
    // Deep-linking to a section you can't open shouldn't render a broken page.
    if (currentItem && !sessionLoading && !can(currentItem.permission)) {
      return (
        <Panel>
          <NoAccess permission={currentItem.permission} />
        </Panel>

      );
    }

    switch (active) {
      case "summary":
        return <Summary summary={counts} users={users} loading={loadingData} onNavigate={navigate} />;
      case "content":
        return (
          <Panel>
            <Toolbar>
              <SearchInput
                value={contentSearch}
                onChange={setContentSearch}
                placeholder="Search by title, body or author…"
                className="w-full sm:w-80"
              />
              <Select
                label="Content type"
                value={manage}
                onChange={setManage}
                options={CONTENT_TYPES}
                className="sm:ml-auto"
              />
            </Toolbar>
            {/* Content renders a raw table and has no loading state of its
                own, so the skeleton is owned here. */}
            {loadingData ? (
              <TableSkeleton rows={6} cols={5} />
            ) : (
              <Content
                contents={filteredContents}
                type={manage}
                users={users}
                editItem={editItem}
              />
            )}

          </Panel>
        );
      case "user":
        return <User />;
      case "report":
        return <Report />;
      case "tasks":
        return <Tasks />;
      case "subscriptions":
        return <Subscriptions users={users} />;
      case "withdrawal":
        return <Withdrawal />;
      case "hire-requests":
        return <HireRequests users={users} />;
      case "removal-logs":
        return <RemovalLogs users={users} />;
      case "administrators":
        return <Administrators />;
      default:
        return (
          <Panel>
            <NoAccess>That section doesn&apos;t exist. Pick one from the sidebar.</NoAccess>
          </Panel>
        );
    }
  };

  return (
    <>
      <title>Admin console · ExpertHub</title>
      <AdminShell
        groups={visibleGroups}
        active={active}
        onNavigate={navigate}
        title={currentItem?.title}
        loading={sessionLoading}
        admin={adminIdentity}
        onSignOut={signOut}

      >
        {/* Sections that ship their own header (Administrators) opt out here. */}
        {currentItem && active !== "administrators" && (
          <PageHeader
            title={currentItem.title}
            description={currentItem.description}
          />
        )}
        {renderSection()}
      </AdminShell>
    </>
  );
}
