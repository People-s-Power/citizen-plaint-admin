import React, { useState } from 'react';
import { Dropdown, ButtonToolbar } from "rsuite";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import router, { useRouter } from "next/router"
import DropdownComp from './DropdownComp';
import AddUpdates from './modals/AddUpdates';
import { useAtom } from 'jotai';
import { accessAtom } from '../atoms/adminAtom';
import { checkAccess } from '@/utils/accessUtils';

const Table = ({ contents, type }) => {
  const { query } = useRouter()
  const [openUpdate, setOpenUpdate] = useState(false)
  const [data, setData] = useState()
  const [access] = useAtom(accessAtom);

  const deleteItem = async (id) => {
    // determine required permission
    const permissionMap = {
      petition: 'Delete Petitions',
      post: 'Delete Posts',
      event: 'Delete Events',
      update: 'Delete Petition Updates',
      victory: 'Delete Victories',
      advert: 'Delete Adverts'
    }

    const required = permissionMap[type] || `Delete ${type}`

    if (!checkAccess(access, required)) {
      toast.warn('You do not have permission to delete this item.')
      return
    }

    try {
      const { data } = await axios.put(`${type}/delete-${type}`, {
        orgId: query?.page,
        [type + 'Id']: id
      });
      console.log(data)
      toast(`${type} deleted successfully!`)
    } catch (e) {
      // console.log(e)
      toast.warn(e.response?.data?.message || 'Failed to delete item')
    }
  }



  return (
    <div>
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
          {contents.length > 0 ? contents.map(user => (
            <tr key={user._id}>
              <td className="p-3">
                {user.createdAt.substring(0, 10)}
              </td>
              <td className="p-3">
                {
                  type === "petition" ? <a className="flex text-[#000]" href={`https://www.theplaint.org/campaigns/${user.slug}`} target="_blank">
                    <img className="w-10 h-10 mr-2" src={user.asset[0]?.url} alt="" />
                    <span >{user.title || user.name || user.caption || user.body.slice(0, 20)}</span>
                  </a> : <a className="flex text-[#000]" href={`https://www.theplaint.org/${type.charAt(0).toUpperCase() + type.slice(1)}?page=${user._id}`} target="_blank">
                    <img className="w-10 h-10 mr-2" src={user.asset[0]?.url} alt="" />
                    <span >{user.title || user.name || user.caption || user.body.slice(0, 20)}</span>
                  </a>
                }
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
                {user?.numberOfPaidViewsCount + "  |  " + user.views.length}
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
                    <DropdownComp data={user} type={type} />
                    {
                      type === "petition" && (
                        <Dropdown.Item>
                          <p
                            onClick={() => {
                              // require permission to create petition updates
                              if (checkAccess(access, 'Make Petition Updates')) {
                                setData(user);
                                setOpenUpdate(true);
                              } else {
                                toast.warn('You do not have permission to add petition updates.')
                              }
                            }}
                            className="cursor-pointer"
                          >
                            Add Update
                          </p>
                        </Dropdown.Item>
                      )
                    }
                    <Dropdown.Item>  <p onClick={() => deleteItem(user._id)} className="cursor-pointer text-[#81171B]">Delete</p></Dropdown.Item>
                    <Dropdown.Item>  <p onClick={() => deleteItem(user._id)} className="cursor-pointer">Share</p></Dropdown.Item>
                  </Dropdown>
                </ButtonToolbar>
              </td>
            </tr>
          )) : <div className='text-center my-4 text-xl'>No {type} created</div>}
        </tbody>
      </table>
      <ToastContainer />
      <AddUpdates open={openUpdate} handelClick={() => setOpenUpdate(!openUpdate)} update={null} petition={data} />

    </div>
  );
};

export default Table;