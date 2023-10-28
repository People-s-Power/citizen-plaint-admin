import React, { useEffect, useState } from 'react';
import axios from "axios";
import { getCookie } from "cookies-next";

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const user = getCookie("user");

  const getTasks = async () => {
    try {
      const { data } = await axios.get("auth/task?page=1&limit=20")
      setTasks(data.data.tasks.tasks)
      console.log(data.data.tasks.tasks)
    } catch (e) {
      console.log(e)
    }
  }

  const completed = async (id) => {
    try {
      const { data } = await axios.post(`auth/task/${id}`, {
        status: "DONE",
        prof: user
      })
      setTasks(data.data.tasks.tasks)
      console.log(data.data.tasks.tasks)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getTasks()
  }, [])

  return (
    <div>
      <table className="table-auto w-full ">
        <thead className="bg-gold text-white text-left rounded-md">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Name</th>
            <th className="p-3">Author</th>
            <th className="p-3">Status</th>
            <th className="p-3">Due Date</th>
            {/* <th className="p-3">Endorsement</th> */}
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? tasks.map(task => (
            <tr key={task._id}>
              <td className="p-3">
                {task.createdAt.substring(0, 10)}
              </td>
              <td className="p-3">
                {task.name}
              </td>
              <td className="p-3">
                {task.author.name}
              </td>
              <td className="p-3">
                {task.status}
              </td>
              <td className="p-3">
                {task.dueDate.substring(0, 10)}
              </td>
              <td className="p-3">
                {task.status === "DONE" ? "" : <button onClick={() => completed(task._id)} className='p-2 bg-warning rounded-md text-white'>Complete</button>}
              </td>
            </tr>
          )) : null}
        </tbody>
      </table>
    </div>
  );
};

export default Tasks;