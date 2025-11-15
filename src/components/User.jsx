import React, { useEffect, useState } from "react";
import { Dropdown, Checkbox } from "rsuite";
import MessageModal from "./MessageModal";
import axios from "axios";
import Select from "react-select";

const PROFESSIONS = [
  "General Administrative Assistant",
  "Social Media Manager ",
  "Real Estate",
  "Virtual Research",
  "Virtual Data Entry",
  "Virtual Book keeper",
  "Virtual ecommerce",
  "Customer Service Provider (Phone/Chat",
  "Content Writer",
  "Website Management",
  "Public Relation Assistant",
  "Graphic designs",
  "Appointment/Calendar setter",
  "Email Management",
  "Campaign/petition Writer",
];

const User = () => {
  const [modal, setModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [checkedAll, setCheckedAll] = useState(false);
  const [categoryValue, setCategoryValue] = useState();
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState();
  const [role, setRole] = useState("");
  const [professionValue, setProfessionValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const category = [
    { value: "human right awareness", label: "Human right awareness" },
    { value: "social policy", label: "Social Policy" },
    { value: "criminal justice", label: "Criminal Justice" },
    { value: "human right action", label: "Human Right Action" },
    { value: "environment", label: "Environment" },
    { value: "health", label: "Health" },
    { value: "disability", label: "Disability" },
    { value: "equality", label: "Equality" },
    { value: "others", label: "Others" },
  ];
  useEffect(() => {
    // Get countries
    axios
      .get(window.location.origin + "/api/getCountries")
      .then((res) => {
        const calculated = res.data.map((country) => ({
          label: country,
          value: country,
        }));
        setCountries(calculated);
      })
      .catch((err) => console.log(err));
  }, []);

  const getAll = () => {
    try {
      axios.get("/user").then((res) => {
        console.log(res.data.data);
        setUsers(res.data.data.users);
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAll();
  }, []);

  const [allChecked, setAllChecked] = useState([]);

  const search = (value) => {
    if (value === "") return getAll();
    const matchingStrings = [];
    for (const string of users) {
      if (string.name.toLowerCase().includes(value)) {
        matchingStrings.push(string);
      }
    }
    setAllUser(matchingStrings);
  };

  const editUser = async (id, status) => {
    try {
      const { data } = await axios.put(`/user/single/${id}`, {
        isActive: !status,
      });
      console.log(data);
      alert(`User is ${status ? "Unactive" : "Active"}`);
      getAll();
    } catch (e) {
      console.log(e);
    }
  };

  const multiBlock = (type) => {
    console.log(allChecked);
    if (allChecked.length >= 1) {
      allChecked.map(async (checked) => {
        try {
          const { data } = await axios.put(`/user/single/${checked._id}`, {
            isActive: false,
          });
          // console.log(data);
        } catch (e) {
          console.log(e);
        }
      });
      alert(`Users Blocked successfully `);
      getAll();
    } else {
      alert("Select Users");
    }
  };

  const multiActivate = (type) => {
    console.log(allChecked);
    if (allChecked.length >= 1) {
      allChecked.map(async (checked) => {
        try {
          const { data } = await axios.put(`/user/single/${checked._id}`, {
            isActive: true,
          });
          // console.log(data);
        } catch (e) {
          console.log(e);
        }
      });
      alert(`Users Activated successfully `);
      getAll();
    } else {
      alert("Select Users");
    }
  };

  const conditionalAttributes = {
    // Add attributes conditionally
    ...(checkedAll && { checked: true }),
    // You can add more attributes here as needed
  };

  return (
    <div>
      <div className="flex flex-row flex-wrap justify-between items-center my-6 bg-white rounded-lg shadow p-6 gap-4">
        <div className="flex flex-row flex-wrap gap-4 items-center justify-between w-auto">
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            type="text"
            placeholder="Search users by name..."
            className="p-3 rounded-md border w-full focus:outline-warning focus:ring-2 focus:ring-warning"
          />
          <button
            onClick={() => multiBlock()}
            className="p-3 border border-[#C98821] rounded-md text-[#C98821] bg-[#FFF7E6] hover:bg-[#FFE0B2] transition font-semibold"
          >
            Block
          </button>
          <button
            onClick={() => multiActivate()}
            className="p-3 border border-[#00401C] rounded-md text-[#00401C] bg-[#E6FFF7] hover:bg-[#B2FFE0] transition font-semibold"
          >
            Activate
          </button>
          <button
            onClick={() => setModal(true)}
            className="p-3 border border-[#1976D2] rounded-md text-[#1976D2] bg-[#E3F2FD] hover:bg-[#BBDEFB] transition font-semibold"
          >
            Send Message
          </button>
          <select
            onChange={(e) => setRole(e.target.value)}
            className="border p-3 rounded-md min-w-[160px] text-gray-700 focus:outline-warning"
            value={role}
          >
            <option className="hidden" value="">
              Select a user category
            </option>
            <option value="All">All Users</option>
            {/* <option value="Campaigner">Campaigner</option> */}
            <option value="Organization">Organization</option>
            {/* <option value="Staff">Staff</option> */}
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
          </select>
          <select
            className="border p-3 rounded-md min-w-[180px] text-gray-700 focus:outline-warning"
            value={professionValue}
            onChange={(e) => setProfessionValue(e.target.value)}
          >
            <option value="">All Virtual Assistants</option>
            {PROFESSIONS.map((prof) => (
              <option key={prof} value={prof}>
                {prof}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <table className="min-w-full border rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gold text-white">
            <tr>
              <th className="p-3 font-semibold text-left">Select</th>
              <th className="p-3 font-semibold text-left">Name</th>
              <th className="p-3 font-semibold text-left">Email</th>
              <th className="p-3 font-semibold text-left">Account Type</th>
              <th className="p-3 font-semibold text-left">Profession</th>
              <th className="p-3 font-semibold text-left">Status</th>
              <th className="p-3 font-semibold text-left">Location</th>
              <th className="p-3 font-semibold text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users
              ?.filter((user) => {
                // Search filter
                if (searchValue && searchValue.trim() !== "") {
                  const val = searchValue.trim().toLowerCase();
                  const professionMatch = user.profession
                    ? (Array.isArray(user.profession)
                      ? user.profession.some(prof => prof.name?.toLowerCase().includes(val))
                      : user.profession.toLowerCase().includes(val))
                    : false;
                  const matches =
                    (user.name && user.name.toLowerCase().includes(val)) ||
                    (user.email && user.email.toLowerCase().includes(val)) ||
                    professionMatch;
                  if (!matches) return false;
                }
                // If 'All' or empty is selected for both filters, show all users
                const roleIsAll = !role || role === "" || role === "All";
                const profIsAll = !professionValue || professionValue === "" || professionValue === "All";
                const countryIsAll = !country || country === "" || country === "All";
                if (roleIsAll && profIsAll && countryIsAll && !searchValue) return true;
                if (!roleIsAll && user.accountType !== role) return false;
                if (!profIsAll) {
                  // Handle both array and string profession formats
                  if (Array.isArray(user.profession)) {
                    const hasMatchingProf = user.profession.some(prof => prof.name === professionValue);
                    if (!hasMatchingProf) return false;
                  } else if (user.profession !== professionValue) {
                    return false;
                  }
                }
                if (!countryIsAll && user.country !== country) return false;
                return true;
              })
              .map((user, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-[#F9FAFB] hover:bg-[#FFF7E6]" : "bg-white hover:bg-[#FFF7E6]"}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      {...conditionalAttributes}
                      onChange={(e) => {
                        if (e.target.checked === true) {
                          allChecked.push(user);
                        } else {
                          allChecked.splice(allChecked.indexOf(user), 1);
                        }
                      }}
                    />
                  </td>
                  <td className="p-3 font-medium">
                    <a
                      className="text-warning hover:underline"
                      href={`https://www.theplaint.org/user?page=${user?._id}`}
                      target="_blank"
                    >
                      {user?.name}
                    </a>
                  </td>
                  <td className="p-3 text-gray-700">{user?.email || "-"}</td>
                  <td className="p-3 text-gray-700">{user?.accountType || user?.role || "-"}</td>
                  <td className="p-3 text-gray-700">
                    {user?.profession
                      ? (Array.isArray(user.profession)
                        ? user.profession.map(prof => prof.name).join(", ")
                        : user.profession)
                      : "-"}
                  </td>
                  <td className="p-3">
                    {user?.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#00401C] text-white text-xs font-semibold">Active</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#970808] text-white text-xs font-semibold">Inactive</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-700">{user?.city || "-"}{user?.country ? `, ${user.country}` : ""}</td>
                  <td className="p-3">
                    <Dropdown
                      placement="rightStart"
                      title={
                        <img
                          className="h-4 w-4"
                          src="/images/edit.svg"
                          alt=""
                        />
                      }
                      noCaret
                    >
                      <Dropdown.Item>
                        <a
                          href={`https://www.theplaint.org/messages?page=${user?._id}`}
                          target="_blank"
                          className="text-warning"
                        >
                          Send Message
                        </a>
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <p
                          onClick={() => editUser(user._id, user.isActive)}
                          className="cursor-pointer text-[#970808]"
                        >
                          Block User
                        </p>
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <p
                          onClick={() => editUser(user._id, user.isActive)}
                          className="cursor-pointer text-[#00401C]"
                        >
                          Activate User
                        </p>
                      </Dropdown.Item>
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
