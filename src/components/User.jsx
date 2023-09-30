import React, { useEffect, useState } from "react";
import { Dropdown, Checkbox } from "rsuite";
import MessageModal from "./MessageModal";
import axios from "axios";

const User = () => {
  const [modal, setModal] = useState(false)
  const [users, setUsers] = useState([]);

  const getAll = () => {
    try {
      axios.get("/user").then((res) => {
        // console.log(res.data.data);
        setUsers(res.data.data.users);
      });
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getAll()
  }, [])
  const allChecked = []

  const search = (value) => {
    if (value === "") return getAll()
    const matchingStrings = []
    for (const string of users) {
      if (string.name.toLowerCase().includes(value)) {
        matchingStrings.push(string);
      }
    }
    setAllUser(matchingStrings)
  }

  const editUser = async (id, status) => {
    try {
      const { data } = await axios.put(
        `https://shark-app-28vbj.ondigitalocean.app/v1/user/single/${id}`,
        {
          isActive: !status
        }
      );
      console.log(data);
      alert(`User is ${status ? 'Unactive' : 'Active'}`)
      getAll()
    } catch (e) {
      console.log(e)
    }
  }

  const multiEdit = (type) => {
    if (allChecked.length >= 1) {
      allChecked.map(async (checked) => {
        try {
          const { data } = await axios.put(
            `https://shark-app-28vbj.ondigitalocean.app/v1/user/single/${checked._id}`,
            {
              isActive: !checked.isActive
            }
          );
          // console.log(data);
        } catch (e) {
          console.log(e)
        }
      })
      alert(`Users ${type} successfully `)
      getAll()
    }
  }

  return (
    <div>
      <div className="flex my-3">
        <input onChange={e => search(e.target.value)} type="text" placeholder="Search" className="p-3 rounded-md border w-[30%]" />
        <button onClick={() => multiEdit('Blocked')} className="p-3 border border-[#000000] rounded-md text-[#C98821] mx-6">Block</button>
        <button onClick={() => multiEdit('Activated')} className="p-3 border border-[#000000] rounded-md text-[#C98821] mx-6">Activate</button>
        <button onClick={() => setModal(true)} className="p-3 border border-[#000000] rounded-md text-[#C98821] mx-6">Send Message</button>

      </div>
      <div>
        <table className="table-auto w-full ">
          <thead className="bg-gold text-white text-left rounded-md">
            <tr>
              <th className="p-3">
                {/* <Checkbox > </Checkbox> */}
              </th>
              <th className="p-3">User</th>
              <th className="p-3">Status</th>
              <th className="p-3">User Description</th>
              <th className="p-3">Location</th>
              <th className="p-3">Interest</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td className="p-3">
                  <input type="checkbox" onChange={e => {
                    if (e.target.checked === true) {
                      allChecked.push(user)
                    } else {
                      allChecked.splice(allChecked.indexOf(user), 1)
                    }
                  }} />
                </td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">
                  {user.isActive ? (
                    <button className="rounded-full bg-[#00401C] p-1">
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
                    <button className="rounded-full bg-[#970808] p-3"></button>
                  )}
                </td>
                <td className="p-3">
                  {user.description.substring(0, 20)}
                  {user.description.length > 20 ? "..." : null}
                </td>
                <td>
                  {user.city}, {user.country}
                </td>
                <td className="p-3">{user.interests[0]}</td>
                <td className="p-3">
                  <Dropdown
                    placement="bottomEnd"
                    title={
                      <img className="h-4 w-4" src="/images/edit.svg" alt="" />
                    }
                    noCaret
                  >
                    <Dropdown.Item> <a href={`https://www.theplaint.org/messages?page=${user._id}`} target="_blank">Send Message</a> </Dropdown.Item>
                    <Dropdown.Item> <p onClick={() => editUser(user._id, user.isActive)} className="cursor-pointer">Block User</p> </Dropdown.Item>
                    <Dropdown.Item> <p onClick={() => editUser(user._id, user.isActive)} className="cursor-pointer">Activate User</p></Dropdown.Item>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MessageModal open={modal} handleClose={() => setModal(false)} />
    </div>
  );
};

export default User;
