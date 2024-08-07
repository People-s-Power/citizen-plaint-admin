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

export default function Home() {
  const [active, setActive] = useState("summary");
  const [counts, setCounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [contents, setContents] = useState([])
  const [manage, setManage] = useState("petition")
  const { query } = useRouter()

  useEffect(() => {
    query.page !== undefined && setActive(query.page)
    // console.log(query.page)
  }, [query.page])


  const getAll = () => {
    try {
      axios.get("/" + manage + "?page=1&limit=100").then((res) => {
        // console.log(res.data.data);
        setContents(res.data.data.petitons?.petitons || res.data.data[manage + 's'][manage + 's'] || res.data.data.victory.victory);
      });
    } catch (err) {
      console.log(err);
    }
  }
  const editItem = async (id, status) => {
    try {
      const { data } = await axios.post(
        `/${manage}/${id}`,
        {
          status
        }
      );
      console.log(data);
      alert(`${manage} is ${status}`)
      getAll()
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getAll()
  }, [manage])

  useEffect(() => {
    try {
      axios.get("/admin/count").then((res) => {
        // console.log(res.data.data);
        setCounts(res.data.data);
      });
    } catch (err) {
      console.log(err);
    }
    try {
      axios.get("/user").then((res) => {
        // console.log(res.data.data);
        setUsers(res.data.data.users);
      });
    } catch (err) {
      console.log(err);
    }
    try {
      axios.get("/report").then((res) => {
        // console.log(res.data.data);
        setReports(res.data.data.reports);
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <>
      <FrontLayout>
        <div className="mx-40 pt-6">
          <div className="flex w-[65%] mx-auto justify-between">
            <div
              onClick={() => router.push("?page=summary")}
              className={
                active === "summary"
                  ? "border-b border-warning cursor-pointer"
                  : "cursor-pointer"
              }
            >
              Summary
            </div>
            <div
              onClick={() => router.push("?page=content")}
              className={
                active === "content"
                  ? "border-b border-warning cursor-pointer"
                  : "cursor-pointer"
              }
            >
              Manage Content
            </div>
            <div
              onClick={() => router.push("?page=social")}
              className={
                active === "social"
                  ? "border-b border-warning cursor-pointer"
                  : "cursor-pointer"
              }
            >
              Social Connect
            </div>
            <div
              onClick={() => router.push("?page=user")}
              className={
                active === "user"
                  ? "border-b border-warning cursor-pointer"
                  : "cursor-pointer"
              }
            >
              User
            </div>
            <div
              onClick={() => router.push("?page=report")}
              className={
                active === "report"
                  ? "border-b border-warning cursor-pointer"
                  : "cursor-pointer"
              }
            >
              Report
            </div>
            <div
              onClick={() => router.push("?page=subscriptions")}
              className={
                active === "subscriptions"
                  ? "border-b border-warning cursor-pointer"
                  : "cursor-pointer"
              }
            >
              Subscriptions
            </div>
            <div
              onClick={() => router.push("?page=withdrawal")}
              className={
                active === "withdrawal"
                  ? "border-b border-warning cursor-pointer"
                  : "cursor-pointer"
              }
            >
              Withdrawal
            </div>
          </div>
          <div className="pt-4">
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
                case "subscriptions":
                  return <Subscriptions users={users} />;
                case "withdrawal":
                  return <Withdrawal />;
                case "social":
                  return <div className="text-center my-8">
                    Coming Soon
                  </div>;
              }
            })()}
          </div>
        </div>
      </FrontLayout>
    </>
  );
}
