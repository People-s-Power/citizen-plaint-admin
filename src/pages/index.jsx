import React, { useState, useEffect } from "react";
import axios from "axios";
import FrontLayout from "@/components/Layout";
import Summary from "@/components/Summary";
import User from "@/components/User";
import Report from "@/components/Reports";
import Content from "@/components/Content"

export default function Home() {
  const [active, setActive] = useState("summary");
  const [counts, setCounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [contents, setContents] = useState([])
  const [manage, setManage] = useState("petition")

  const getAll = () => {
    try {
      axios.get("/" + manage).then((res) => {
        console.log(res.data.data);
        setContents(res.data.data[manage + 's'] || res.data.data.petitons || res.data.data.victory);
      });
    } catch (err) {
      console.log(err);
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
          <div className="flex w-1/2 mx-auto justify-between">
            <div
              onClick={() => setActive("summary")}
              className={
                active === "summary"
                  ? "border-b border-warning cursor-pointer"
                  : "cursor-pointer"
              }
            >
              Summary
            </div>
            <div
              onClick={() => setActive("content")}
              className={
                active === "content"
                  ? "border-b border-warning cursor-pointer"
                  : "cursor-pointer"
              }
            >
              Manage Content
            </div>
            <div
              onClick={() => setActive("user")}
              className={
                active === "user"
                  ? "border-b border-warning cursor-pointer"
                  : "cursor-pointer"
              }
            >
              User
            </div>
            <div
              onClick={() => setActive("report")}
              className={
                active === "report"
                  ? "border-b border-warning cursor-pointer"
                  : "cursor-pointer"
              }
            >
              Report
            </div>
          </div>
          <div className="pt-4">
            {(() => {
              switch (active) {
                case "summary":
                  return <Summary summary={counts} />;
                case "content":
                  return <div>
                    <div className="">
                      <select onChange={(e) => setManage(e.target.value)} className="float-right p-2 border my-5">
                        <option value="petition">Petition</option>
                        <option value="post" >Post</option>
                        <option value="event">Events</option>
                        <option value="advert">Advert</option>
                        <option value="victory">Victory</option>
                        <option value="update">Update</option>
                      </select>
                    </div>
                    <Content contents={contents} users={users} />
                  </div>;
                case "user":
                  return <User users={users} />;
                case "report":
                  return <Report report={reports} />;
              }
            })()}
          </div>
        </div>
      </FrontLayout>
    </>
  );
}
