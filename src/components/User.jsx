import React, { useEffect, useState } from "react";
import { Dropdown, Checkbox } from "rsuite";
import MessageModal from "./MessageModal";
import axios from "axios";
import Select from "react-select";

const User = () => {
  const [modal, setModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [checkedAll, setCheckedAll] = useState(false);
  const [categoryValue, setCategoryValue] = useState();
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState();
  const [role, setRole] = useState("");

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
      <div className="flex justify-between my-3">
        <div className="flex w-[70%]">
          <input
            onChange={(e) => search(e.target.value)}
            type="text"
            placeholder="Search"
            className="p-3 rounded-md mr-4 border w-[30%]"
          />
          <button
            onClick={() => multiBlock()}
            className="p-3 border border-[#000000] rounded-md text-[#C98821] mx-4"
          >
            Block
          </button>
          <button
            onClick={() => multiActivate()}
            className="p-3 border border-[#000000] rounded-md text-[#C98821] mx-4"
          >
            Activate
          </button>
          <button
            onClick={() => setModal(true)}
            className="p-3 border border-[#000000] rounded-md text-[#C98821] mx-4"
          >
            Send Message
          </button>
        </div>
        <div className="flex w-[50%]">
          <select
            onChange={(e) => setRole(e.target.value)}
            className="border mr-4 p-3 border-[#000000] rounded-md"
          >
            <option className="hidden " value="">
              Selct a user category
            </option>
            <option value="Campaigner">Campaigner</option>
            <option value="Organization">Organization</option>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
          </select>
          <Select
            isClearable={true}
            className="mr-4"
            onChange={(val) => setCategoryValue(val?.value)}
            options={category}
            placeholder="Select an Interest"
          />

          <Select
            options={countries}
            isClearable={true}
            className="mx-4"
            onChange={(e) => {
              setCountry(e?.value);
            }}
            placeholder="Select a Country"
          />
        </div>
      </div>
      <div>
        <table className="table-auto w-full ">
          <thead className="bg-gold text-white text-left rounded-md">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked === true) {
                      allChecked.push(...users);
                      // console.log(users)
                    } else {
                      // allChecked = []
                    }
                    setCheckedAll(e.target.checked);
                  }}
                />
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
            {users?.map((user, index) =>
              (categoryValue === undefined &&
                country === undefined &&
                role === "") ||
              user.accountType === role ||
              user.interests.includes(categoryValue) ||
              user.country === country ? (
                <tr key={index}>
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
                  <td className="p-3">
                    <a
                      className="text-[#000]"
                      href={`https://www.theplaint.org/user?page=${user?._id}`}
                      target="_blank"
                    >
                      {user?.name}
                    </a>{" "}
                  </td>
                  <td className="p-3">
                    {user?.isActive ? (
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
                    {user?.description?.substring(0, 20)}
                    {user?.description?.length > 20 ? "..." : null}
                  </td>
                  <td>
                    {user?.city}, {user?.country}
                  </td>
                  <td className="p-3">{user?.interests?.length ? user?.interests[0] : ""}</td>
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
                        {" "}
                        <a
                          href={`https://www.theplaint.org/messages?page=${user?._id}`}
                          target="_blank"
                        >
                          Send Message
                        </a>{" "}
                      </Dropdown.Item>
                      <Dropdown.Item>
                        {" "}
                        <p
                          onClick={() => editUser(user._id, user.isActive)}
                          className="cursor-pointer"
                        >
                          Block User
                        </p>{" "}
                      </Dropdown.Item>
                      <Dropdown.Item>
                        {" "}
                        <p
                          onClick={() => editUser(user._id, user.isActive)}
                          className="cursor-pointer"
                        >
                          Activate User
                        </p>
                      </Dropdown.Item>
                    </Dropdown>
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>
      <MessageModal open={modal} handleClose={() => setModal(false)} />
    </div>
  );
};

export default User;
