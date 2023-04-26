import React from "react";
import { Dropdown, Checkbox } from "rsuite";

const Content = ({ contents, users }) => {
  const getAuthor = (id) => {
    var name
    users.map((user) => {
      if (user._id === id) {
        name = user.name
      }
    })
    return name
  }

  return (
    <div>
      <div>
        <table className="table-auto w-full ">
          <thead className="bg-gold text-white text-left rounded-md">
            <tr>
              {/* <th className="p-3">
                <Checkbox> </Checkbox>
              </th> */}
              <th className="p-3">Date</th>
              <th className="p-3">Title</th>
              <th className="p-3">Author</th>
              <th className="p-3">Status</th>
              {/* <th className="p-3">Promotion Amount | Target</th> */}
              <th className="p-3">Views</th>
              <th className="p-3">Endorsement</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {contents.map((user, index) => (
              <tr key={index}>
                <td className="p-3">
                  {user.createdAt.substring(0, 10)}
                </td>
                <td className="p-3 flex">
                  <img className="w-10 h-10 mr-2" src={user.image[0]} alt="" />
                  <span>{user.title || user.name || user.caption}</span>
                </td>
                <td className="p-3">{getAuthor(user.author)}</td>
                <td className="p-3">
                  {user.status === "Active" ? (
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
                {/* <td className="p-3">
                </td> */}
                <td className="p-3">
                  {user.views?.length}
                </td>
                <td className="p-3">
                  {user.endorsements?.length}
                </td>
                <td className="p-3">
                  <Dropdown
                    placement="bottomEnd"
                    title={
                      <img className="h-4 w-4" src="/images/edit.svg" alt="" />
                    }
                    noCaret
                  >
                    <Dropdown.Item>Promote</Dropdown.Item>
                    <Dropdown.Item>Edit</Dropdown.Item>
                    <Dropdown.Item>Share</Dropdown.Item>
                    <Dropdown.Item>Delete</Dropdown.Item>
                    <Dropdown.Item>Block</Dropdown.Item>
                    <Dropdown.Item>Activate</Dropdown.Item>
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

export default Content;
