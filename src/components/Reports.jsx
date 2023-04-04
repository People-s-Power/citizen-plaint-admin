import React, { useEffect, useState } from "react";
import { Dropdown } from "rsuite";
import axios from "axios";

const Reports = ({ report }) => {
  const [reports, setReports] = useState(report);
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
          console.log(res.data);
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
            {reports.map((report, index) => (
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
                <td className="p-3">
                  {report.body.substring(0, 10)}
                  {report.body.length > 20 ? "..." : null}
                </td>
                <td className="p-3">
                  <Dropdown
                    placement="bottomEnd"
                    title={
                      <img className="h-4 w-4" src="/images/edit.svg" alt="" />
                    }
                    noCaret
                  >
                    <Dropdown.Item>Block </Dropdown.Item>
                    <Dropdown.Item>Activate </Dropdown.Item>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
