import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import { adminAtom } from '@/atoms/adminAtom';
import Reviews from './modals/Reviews';

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [open, setOpen] = useState(false)
  const [admin] = useAtom(adminAtom);

  const router = useRouter();
  const getTasks = async () => {
    try {
      const { data } = await axios.get("auth/task?page=1&limit=20")
      const allTasks = data.data.tasks.tasks;
      // If route starts with /admin, show all tasks
      if (router.pathname.startsWith('/admin')) {
        setTasks(allTasks);
        console.log(allTasks);
      } else {
        // Otherwise, filter to assigned tasks
        const profId = admin?._id || admin?.id;
        const assignedTasks = allTasks.filter(task => Array.isArray(task.assigne) && task.assigne.includes(profId));
        setTasks(assignedTasks);
        console.log(assignedTasks);
      }
    } catch (e) {
      console.log(e)
    }
  }

  const completed = async (id) => {
    try {
      const profId = admin?._id || admin?.id;
      const { data } = await axios.post(`auth/task/${id}`, {
        status: "DONE",
        prof: profId
      })
      const allTasks = data.data.tasks.tasks;
      if (router.pathname.startsWith('/admin')) {
        setTasks(allTasks);
        console.log(allTasks);
      } else {
        const assignedTasks = allTasks.filter(task => Array.isArray(task.assigne) && task.assigne.includes(profId));
        setTasks(assignedTasks);
        console.log(assignedTasks);
      }
      setOpen(true);
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
          {tasks.length > 0 ? (
            tasks.map(task => (
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
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-6 text-center text-gray-400">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Reviews open={open} handelClick={() => setOpen(false)} />
    </div>
  );
};

export default Tasks;