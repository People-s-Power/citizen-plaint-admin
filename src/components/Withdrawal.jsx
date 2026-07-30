import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Withdrawal = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const getAll = () => {
    try {
      axios.get("/admin/withdrawals?page=1&limit=100&status=Pending").then((res) => {
        setRequests(res.data.withdrawals || [])
      });
    } catch (err) {
      console.log(err);
    }
  }

  const approve = async (id) => {
    try {
      setLoading(true)
      await axios.post(`/admin/withdrawals/${id}/process`)
      toast.success("Withdrawal processed")
      await getAll()
    } catch (err) {
      console.log(err);
      toast.warn(err?.response.data.message)
    } finally {
      setLoading(false)
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
            <th className="p-3">Provider</th>
            <th className="p-3">Status</th>
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
                {request.provider || "-"}
              </td>
              <td className="p-3">
                {request.status || "Pending"}
              </td>
              <td className="p-3">
                <button onClick={() => approve(request._id)} className="p-2 rounded-md bg-warning text-white">
                  {loading ? "Processing..." : "Process"}
                </button>
              </td>
            </tr>
          )) : <div className='p-8 text-center text-xl'>No withdrawal</div>}
        </tbody>
      </table>
      <ToastContainer />
    </div>
  );
};

export default Withdrawal;
