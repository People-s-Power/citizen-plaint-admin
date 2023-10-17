import React from 'react';
import { Dropdown, ButtonToolbar } from "rsuite";

const Table = ({ contents, type }) => {

  return (
    <table className="table-auto w-full ">
      <thead className="bg-gold text-white text-left rounded-md">
        <tr>
          {/* <th className="p-3">
                <Checkbox> </Checkbox>
              </th> */}
          <th className="p-3">Date</th>
          <th className="p-3">Title</th>
          {/* <th className="p-3">Author</th> */}
          <th className="p-3">Status</th>
          <th className="p-3 w-44 text-center">Promotion <br /> Amount | Target</th>
          <th className="p-3">Views</th>
          <th className="p-3">Endorsement</th>
          <th className="p-3">Action</th>
        </tr>
      </thead>
      <tbody>
        {contents.length > 0 ? contents.map((user, index) => (
          <tr key={index}>
            <td className="p-3">
              {user.createdAt.substring(0, 10)}
            </td>
            <td className="p-3">
              <a className="flex text-[#000]" href={`https://www.theplaint.org/${type.charAt(0).toUpperCase() + type.slice(1)}?page=${user._id}`} target="_blank">
                <img className="w-10 h-10 mr-2" src={user.asset[0]?.url} alt="" />
                <span >{user.title || user.name || user.caption || user.body.slice(0, 20)}</span>
              </a>
            </td>
            {/* <td className="p-3"> <a className="text-[#000]" target="_blank" href={`https://www.theplaint.org/user?page=${user.author}`}>{getAuthor(user.author)}</a> </td> */}
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
            <td className="p-3 text-center">
              {user.views.length + "  |  " + user?.numberOfPaidViewsCount}
            </td>
            <td className="p-3">
              {user.views?.length}
            </td>
            <td className="p-3">
              {user.endorsements?.length}
            </td>
            <td className="p-3">
              <ButtonToolbar>
                <Dropdown
                  placement="rightStart"
                  title={
                    <img className="h-4 w-4" src="/images/edit.svg" alt="" />
                  }
                  noCaret
                >
                  <Dropdown.Item> <p onClick={() => editItem(user._id, 'Blocked')} className="cursor-pointer">Block</p> </Dropdown.Item>
                  <Dropdown.Item>  <p onClick={() => editItem(user._id, 'Active')} className="cursor-pointer">Activate</p></Dropdown.Item>
                </Dropdown>
              </ButtonToolbar>
            </td>
          </tr>
        )) : <div className='text-center my-4 text-xl'>No {type} created</div>}
      </tbody>
    </table>
  );
};

export default Table;