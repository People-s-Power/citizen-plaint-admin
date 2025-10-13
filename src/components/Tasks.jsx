import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useRouter } from 'next/router';
import { useAtom } from 'jotai';
import { adminAtom } from '@/atoms/adminAtom';
import Reviews from './modals/Reviews';
import { getCookie } from "cookies-next";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [admin] = useAtom(adminAtom);
  const router = useRouter();
  const user = getCookie("user");

  const getTasks = async () => {
    try {
      const { data } = await axios.get("auth/task?page=1&limit=20");
      const allTasks = data.data.tasks.tasks;

      if (router.pathname.startsWith('/admin')) {
        setTasks(allTasks);
      } else {
        const profId = admin?._id || admin?.id;
        const assignedTasks = allTasks.filter(
          task => Array.isArray(task.assigne) && task.assigne.includes(profId)
        );
        setTasks(assignedTasks);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const profId = admin?._id || admin?.id;
      const { data } = await axios.post(`auth/task/${id}`, {
        status: newStatus,
        prof: profId
      });
      const allTasks = data.data.tasks.tasks;

      if (router.pathname.startsWith('/admin')) {
        setTasks(allTasks);
      } else {
        const assignedTasks = allTasks.filter(
          task => Array.isArray(task.assigne) && task.assigne.includes(user)
        );
        setTasks(assignedTasks);
      }

      setDropdownOpen(null);
      getTasks();
      if (newStatus === "DONE") setOpen(true);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  // Define all status options
  const allStatusOptions = [
    { label: "Complete", value: "COMPLETE" },
    { label: "Done", value: "DONE" },
    { label: "Overdue", value: "OVERDUE" },
    { label: "Under Review", value: "UNDER_REVIEW" },
    { label: "Ongoing", value: "ONGOING" },
    { label: "Abandoned", value: "ABANDONED" },
  ];

  // For non-admins, restrict options
  const userStatusOptions = [
    { label: "Done", value: "DONE" },
    { label: "Ongoing", value: "ONGOING" },
  ];

  // Choose correct status set depending on route
  const isAdminRoute = router.pathname.startsWith('/admin');

  return (
    <div>
      <table className="table-auto w-full">
        <thead className="bg-gold text-white text-left rounded-md">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Name</th>
            <th className="p-3">Author</th>
            <th className="p-3">Status</th>
            <th className="p-3">Due Date</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{task.createdAt?.substring(0, 10)}</td>
                <td className="p-3">{task.name}</td>
                <td className="p-3">{task.author?.name}</td>
                <td className="p-3 font-medium">{task.status}</td>
                <td className="p-3">{task.dueDate?.substring(0, 10)}</td>
                <td className="p-3 relative">
                  <button
                    onClick={() =>
                      setDropdownOpen(dropdownOpen === task._id ? null : task._id)
                    }
                    className="p-2 bg-gray-700 rounded-md text-sm"
                  >
                    {task.status ? `${task.status} ▾` : "Change Status ▾"}
                  </button>

                  {dropdownOpen === task._id && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-md z-10">
                      {(isAdminRoute ? allStatusOptions : userStatusOptions).map((option) => (
                        <button
                          key={option.value}
                          onClick={() => { updateStatus(task._id, option.value) }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
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
