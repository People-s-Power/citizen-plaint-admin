import React, { useState } from 'react';
import axios from "axios";
import { Modal } from "rsuite"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const AssingProfessional = ({ users, sub, getSub }) => {
  const [open, setOpen] = useState(false)

  const assign = async (id, author, sub) => {
    try {
      axios.post("/admin/assign", {
        userId: id,
        orgId: author,
        subId: sub
      }).then((res) => {
        console.log(res);
        toast("Profesional Assigned Successfully!")
        getSub()
        // setSubs(res.data.data.subscriptions)
      });
    } catch (err) {
      console.log(err);
      toast.warn(err?.response.data.message)
    }
  }

  return (
    <div>
      <button onClick={() => setOpen(true)} className='p-2 bg-warning w-full rounded-md text-white'>Add</button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Modal.Header>
          <div className="border-b border-gray-200 p-3 w-full">
            <Modal.Title>Assign Professional</Modal.Title>
          </div>
        </Modal.Header>
        <div>
          {users.map(user => parseInt(sub.amount) >= 30000 && user.accountType === "Admin" ? <div key={user._id} className='p-3 my-3 flex justify-between bg-[#F5F6FA] rounded-md'>
            <div className='flex'>
              <img className='w-10 h-10 rounded-full' src={user.image} alt="" />
              <p className='my-auto w-44 ml-4'>{user.name}</p>
            </div>
            <p className='my-auto'> {user.orgOperating.length} Orgs</p>
            <button onClick={() => assign(user._id, sub.author, sub._id)} className='p-2  rounded-md bg-warning text-white'>Assign</button>
          </div> : user.accountType === "Editor" && <div key={user._id} className='p-3 my-3 flex justify-between bg-[#F5F6FA] rounded-md'>
            <div className='flex'>
              <img className='w-10 h-10 rounded-full' src={user.image} alt="" />
              <p className='my-auto w-44 ml-4'>{user.name}</p>
            </div>
            <p className='my-auto'> {user.orgOperating.length} Orgs</p>
            <button onClick={() => assign(user._id, sub.author, sub._id)} className='p-2  rounded-md bg-warning text-white'>Assign</button>
          </div>)}
        </div>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default AssingProfessional;