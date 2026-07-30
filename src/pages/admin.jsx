import React, { useState, useEffect } from "react";
import axios from "axios";
import FrontLayout from "@/components/Layout";
import Summary from "@/components/Summary";
import User from "@/components/User";
import Report from "@/components/Reports";
import Content from "@/components/Content"
import router, { useRouter } from "next/router"
import Subscriptions from "@/components/Subscriptions";
import Withdrawal from "@/components/Withdrawal";
import Tasks from "@/components/Tasks";
import HireRequests from "@/components/HireRequests";
import RemovalLogs from "@/components/RemovalLogs";
import Administrators from "@/components/admin/Administrators";
import { useAdminSession } from "@/hooks/useAdminSession";
import { AdminPermission } from "@/lib/adminPermissions";
import { SERVER_URL } from "./_app";

/**
 * Sidebar definition. Each entry declares the permission required to see it,
 * so a Support admin never sees Withdrawals and an Analyst never sees
 * Administrators. The backend enforces the same rules on every request — this
 * is purely so people aren't shown doors they can't open.
 */
const NAV_ITEMS = [
  { key: "summary", label: "Summary", permission: AdminPermission.DashboardView },
  { key: "content", label: "Manage Content", permission: AdminPermission.ContentView },
  { key: "tasks", label: "Manage Tasks", permission: AdminPermission.TasksView },
  { key: "user", label: "User", permission: AdminPermission.UsersView },
  { key: "report", label: "Report", permission: AdminPermission.ReportsView },
  { key: "subscriptions", label: "Subscriptions", permission: AdminPermission.SubscriptionsView },
  { key: "withdrawal", label: "Withdrawal", permission: AdminPermission.WithdrawalsView },
  { key: "hire-requests", label: "Hire Requests", permission: AdminPermission.HireRequestsView },
  { key: "removal-logs", label: "Removal Logs", permission: AdminPermission.RemovalLogsView, danger: true },
  { key: "administrators", label: "Administrators", permission: AdminPermission.AdminsView },
];

export default function Home() {
  const [active, setActive] = useState("summary");
  const { can, loading: sessionLoading } = useAdminSession();

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
  const [contents, setContents] = useState([])
  const [manage, setManage] = useState("petition")
  const { query } = useRouter()
  const contentKeyMap = {
    petition: "petitions",
    post: "posts",
    event: "events",
    advert: "adverts",
    victory: "victories",
    update: "updates",
  }

  useEffect(() => {
    query.page !== undefined && setActive(query.page)
    // console.log(query.page)
  }, [query.page])


  const editItem = async (id, status) => {
    try {
      if (manage !== "petition") {
        alert("Content moderation is only wired for petitions right now.");
        return;
      }
      await axios.post("/petition/approve", { Petition_id: id });
      alert(`petition is ${status}`)
      await loadDashboardData()
    } catch (e) {
      console.log(e)
    }
  }

  const loadDashboardData = async () => {
    try {
      const [usersRes, orgsRes, reportsRes, generalRes] = await Promise.all([
        axios.get("/user"),
        axios.get("/organization"),
        axios.get("/reports"),
        axios.post(`${SERVER_URL}/graphql`, {
          query: `
            query DashboardGeneral {
              general {
                posts { _id createdAt title name caption body asset { url type } author { _id name image } views likes endorsements }
                petitions { _id createdAt title name caption body slug status asset { url type } author { _id name image } views numberOfPaidViewsCount numberOfPaidEndorsementCount endorsements }
                events { _id createdAt name body description asset { url type } author { _id name image } }
                adverts { _id createdAt caption message body asset { url type } author { _id name image } }
                victories { _id createdAt body asset { url type } author { _id name image } }
                updates { _id createdAt body asset { url type } author { _id name image } petition { _id title slug } }
              }
            }
          `,
        }),
      ]);

      const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data?.users || [];
      const orgsData = Array.isArray(orgsRes.data) ? orgsRes.data : orgsRes.data?.data?.Organizations || orgsRes.data?.data?.organizations || [];
      const reportsData = Array.isArray(reportsRes.data) ? reportsRes.data : reportsRes.data?.data?.reports || [];
      const general = generalRes.data?.data?.general || {};
      const selected = general?.[contentKeyMap[manage]] || [];

      setUsers(usersData);
      setReports(reportsData);
      setContents(selected);
      setCounts({
        users: usersData.length,
        orgs: orgsData.length,
        posts: general.posts?.length || 0,
        petitions: general.petitions?.length || 0,
        adverts: general.adverts?.length || 0,
        events: general.events?.length || 0,
        victories: general.victories?.length || 0,
        updates: general.updates?.length || 0,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [manage]);

  return (
    <>
      <FrontLayout>
        <div className="mx-20 pt-6 flex">
          <div className="w-[20%] space-y-6 text-lg font-medium">
            {/* While permissions load we show nothing rather than flashing
                links the user may not be allowed to open. */}
            {sessionLoading
              ? <div className="text-sm text-gray-400">Loading…</div>
              : NAV_ITEMS.filter((item) => can(item.permission)).map((item) => (
                <div
                  key={item.key}
                  onClick={() => router.push(`?page=${item.key}`)}
                  className="cursor-pointer"
                >
                  <span
                    className={
                      active === item.key
                        ? `inline-block border-b ${item.danger ? 'border-red-500 text-red-600' : 'border-warning'}`
                        : ''
                    }
                  >
                    {item.label}
                  </span>
                </div>
              ))}
          </div>
          <div className="w-[80%]">
            {(() => {
              switch (active) {
                case "summary":
                  return <Summary summary={counts} users={users} />;
                case "content":
                  return <div>
                    <div className="flex justify-between my-5">
                      <input type="text" className="p-2 rounded-md border w-[30%]" placeholder="Search" />
                      <select onChange={(e) => setManage(e.target.value)} className=" p-2 border rounded-md">
                        <option value="petition">Petition</option>
                        <option value="post" >Post</option>
                        <option value="event">Events</option>
                        <option value="advert">Advert</option>
                        <option value="victory">Victory</option>
                        <option value="update">Update</option>
                      </select>
                    </div>
                    <Content contents={contents} type={manage} users={users} editItem={editItem} />
                  </div>;
                case "user":
                  return <User />;
                case "report":
                  return <Report />;
                case 'tasks':
                  return <Tasks />;
                case "subscriptions":
                  return <Subscriptions users={users} />;
                case "withdrawal":
                  return <Withdrawal />;
                case "social":
                  return <div className="text-center my-8">
                    Coming Soon
                  </div>;
                case "hire-requests":
                  return <HireRequests users={users} />;
                case "removal-logs":
                  return <RemovalLogs users={users} />;
                case "administrators":
                  return <Administrators />;
              }
            })()}
          </div>
        </div>
      </FrontLayout>
    </>
  );
}
