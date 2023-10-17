import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Modal } from "rsuite"
import AssingProfessional from './AssingProfessional';

const Subscriptions = ({ users }) => {
  const [subs, setSubs] = useState()

  // console.log(users)

  const getAuthor = (id) => {
    var name
    users.map((user) => {
      if (user._id === id) {
        name = user.name
      }
    })
    return name
  }

  const getSub = async () => {
    try {
      axios.get("/sub/unassiged?page=1&limit=100").then((res) => {
        // console.log(res);
        setSubs(res.data.data.subscriptions)
      });
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getSub()
  }, [])

  return (
    <div>
      <table className="table-auto w-full ">
        <thead className="bg-gold text-white text-left rounded-md">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Author</th>
            <th className="p-3">Status</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Duration</th>
            <th className="p-3">Action</th>
          </tr>

        </thead>
        <tbody>
          {subs?.map(sub => <tr key={sub._id}>
            <td className="p-3">{sub.createdAt.substring(0, 10)}</td>
            <td className="p-3">{getAuthor(sub.author)}</td>
            <td className="p-3">
              {sub.expired ? (
                <button className="rounded-full bg-[#970808]  p-1">
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
                <button className="rounded-full bg-[#00401C] p-3"></button>
              )}
            </td>
            <td className="p-3">{sub.amount}</td>
            <td className="p-3">{sub.duration}</td>
            <td className="p-1">
              <AssingProfessional users={users} sub={sub} getSub={() => getSub()} />
            </td>
          </tr>)}
        </tbody>
      </table>

    </div>
  );
};

export default Subscriptions;