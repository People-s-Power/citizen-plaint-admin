import React, { useEffect, useState } from "react";
import { Dropdown, } from "rsuite";
import axios from "axios";

const Reports = () => {
  const [reports, setReports] = useState();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [report, setReport] = useState()
  const [manage, setManage] = useState("All")

  const getReport = () => {
    try {
      axios.get("/report").then((res) => {
        console.log(res.data.data);
        setReports(res.data.data.reports);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const resolve = (id, resolve) => {
    try {
      axios
        .post(`/report/${id}`, {
          resolved: !resolve,
        })
        .then((res) => {
          // console.log(res.data);
          getReport();
        });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getReport();
  }, []);

  return (
    <div>
      <div className="flex my-4 justify-end">
        <select onChange={(e) => setManage(e.target.value)} className=" p-2 border rounded-md">
          <option value="All">All</option>
          <option value="User">User</option>
          <option value="Petition">Petition</option>
          <option value="Post" >Post</option>
          <option value="Event">Events</option>
          <option value="Advert">Advert</option>
          <option value="Victory">Victory</option>
          <option value="Update">Update</option>
        </select>
      </div>
      <div>
        <table className="table-auto w-full ">
          <thead className="bg-gold text-white text-left rounded-md">
            <tr>
              <th className="p-3">DATE</th>
              <th className="p-3">Author</th>
              <th className="p-3">Status</th>
              <th className="p-3">Report</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports?.map((report, index) => report.itemType === manage || manage === "All" ? (
              <tr key={index}>
                <td className="p-3">{report.createdAt.substring(0, 10)}</td>
                <td className="p-3">{report.authorName}</td>
                <td className="p-3">
                  {report.resolved ? (
                    <button
                      onClick={() => resolve(report._id, report.resolved)}
                      className="rounded-full bg-[#00401C] p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="#fff"
                        className="bi bi-check"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => resolve(report._id, report.resolved)}
                      className="rounded-full bg-[#970808] p-3"
                    ></button>
                  )}
                </td>
                <td onClick={() => { handleOpen(), setReport(report) }} className="p-3 cursor-pointer">
                  {report.body.substring(0, 40)}
                  {report.body.length > 40 ? "..." : null}
                </td>
                <td className="p-3">
                  <Dropdown
                      placement="rightStart"
                      title={
                      <img className="h-4 w-4" src="/images/edit.svg" alt="" />
                    }
                    noCaret
                  >
                    <Dropdown.Item>
                    </Dropdown.Item>

                    <Dropdown.Item> <p className="cursor-pointer" onClick={() => resolve(report._id, report.resolved)}>UnResolve</p> </Dropdown.Item>
                    <Dropdown.Item> <p className="cursor-pointer" onClick={() => resolve(report._id, report.resolved)}>Resolve</p>  </Dropdown.Item>
                    <Dropdown.Item> <a href={`https://www.theplaint.org/messages?page=${report.authorId}`} target="_blank">Send Message</a> </Dropdown.Item>
                  </Dropdown>
                </td>
              </tr>
            ) : null)}
          </tbody>
        </table>
        <div>
          {open && <div className="absolute top-40 left-[30%] right-[30%] p-8 rounded-md bg-white w-[40%]">
            <div className="text-center">
              <h3 className="font-bold my-4">Report</h3>
              {report?.body}
              <div className="flex justify-evenly my-6">
                {
                  report.itemType === 'Petition' ?
                    <a href={`https://www.theplaint.org/campaigns/${report.itemId}`} target="_blank">                <button className="p-2 rounded-md bg-[#F9A826] px-6">View</button>
                    </a> : report.itemType === "User" ?
                      <a href={`https://www.theplaint.org/${report.itemType}?page=${report.itemId}`} target="_blank">                <button className="p-2 rounded-md bg-[#F9A826] px-6">View</button>
                      </a>
                      : <a href={`https://www.theplaint.org/${report.itemType}?page=${report.itemId}`} target="_blank">                <button className="p-2 rounded-md bg-[#F9A826] px-6">View</button>
                      </a>
                }
                <button onClick={() => handleClose()} className="p-2 rounded-md border px-6">Close</button>
              </div>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
};

export default Reports;
