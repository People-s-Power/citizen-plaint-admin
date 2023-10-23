import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Withdrawal = () => {
  const [requests, setRequests] = useState([])
  const getAll = () => {
    try {
      axios.get("/withdraw?page=1&limit=100&status=Pending").then((res) => {
        // console.log(res.data.data.data.withdraws);
        setRequests(res.data.data.data.withdraws)
      });
    } catch (err) {
      console.log(err);
    }
  }

  const approve = (id) => {
    try {
      axios.post("/withdraw", {
        withdrawId: id
      }).then((res) => {
        console.log(res.data);
        toast.success("Withdrawal Approved")
      });
    } catch (err) {
      console.log(err);
      toast.warn(err?.response.data.message)
    }
  }

  useEffect(() => {
    getAll()
  }, [])
  return (
    <div>
      <table className="table-auto w-full ">
        <thead className="bg-gold text-white text-left rounded-md">
          <tr>
            {/* <th className="p-3">
                <Checkbox> </Checkbox>
              </th> */}
            <th className="p-3">Date</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Account Name</th>
            <th className="p-3">Bank</th>
            <th className="p-3">Account Number</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? requests.map(request => (
            <tr key={request._id}>
              <td className="p-3">
                {request.createdAt.substring(0, 10)}
              </td>
              <td className="p-3">
                {request.amount}
              </td>
              <td className="p-3">
                {request.account_name}
              </td>
              <td className="p-3">
                {request.account_bank}
              </td>
              <td className="p-3">
                {request.account_number}
              </td>
              <td className="p-3">
                <button onClick={() => approve(request._id)} className="p-2 rounded-md bg-warning text-white">Approve</button>
              </td>
            </tr>
          )) : null}
        </tbody>
      </table>
      <ToastContainer />
    </div>
  );
};

export default Withdrawal;