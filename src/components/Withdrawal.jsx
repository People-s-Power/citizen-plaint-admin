import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Modal } from "rsuite"

const Withdrawal = () => {
  const [requests, setRequests] = useState([])
  const [tCode, setTCode] = useState()
  const [otp, setOpt] = useState()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
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
        setTCode(res.data.data.transfer_code)
        setOpen(true)
        // toast.success("Withdrawal Approved")
      });
    } catch (err) {
      console.log(err);
      toast.warn(err?.response.data.message)
    }
  }

  const sendOtp = () => {
    setLoading(true)
    try {
      axios.post("/withdraw/otp", {
        transfer_code: tCode,
        otp
      }).then((res) => {
        console.log(res.data);
        setOpen(false)
        toast.success("Withdrawal Approved")
        setLoading(false)
      });
    } catch (err) {
      console.log(err);
      toast.warn(err?.response.data.message)
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
          )) : <div className='p-8 text-center text-xl'>No withdrawal</div>}
        </tbody>
      </table>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Modal.Header>
          <Modal.Title> Enter OTP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <input className="p-3 border rounded-md w-full" onChange={e => setOpt(e.target.value)} type="number" placeholder="Enter OTP" />
            <button onClick={() => sendOtp()} className="bg-warning p-3 mt-4 rounded-md w-32 mx-auto">{loading ? "loading..." : "Send"}</button>
          </div>
        </Modal.Body>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default Withdrawal;