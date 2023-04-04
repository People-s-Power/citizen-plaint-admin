import React from "react";
import { Dropdown, Checkbox,  } from "rsuite";

const User = ({ users }) => {
  return (
    <div>
      <div>
        <table className="table-auto w-full ">
          <thead className="bg-gold text-white text-left rounded-md">
            <tr>
              <th className="p-3">
                <Checkbox> </Checkbox>
              </th>
              <th className="p-3">User</th>
              <th>Status</th>
              <th>User Description</th>
              <th>Location</th>
              <th>Interest</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td className="p-3">
                  <Checkbox> </Checkbox>
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
                <td>
                  {user.description.substring(0, 20)}
                  {user.description.length > 20 ? "..." : null}
                </td>
                <td>
                  {user.city}, {user.country}
                </td>
                <td>{user.interests[0]}</td>
                <td className="">
                  <Dropdown
                    placement="bottomEnd"
                    title={
                      <img className="h-4 w-4" src="/images/edit.svg" alt="" />
                    }
                    noCaret
                  >
                    <Dropdown.Item>Send Message</Dropdown.Item>
                    <Dropdown.Item>Block User</Dropdown.Item>
                    <Dropdown.Item>Activate User</Dropdown.Item>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default User;
