import React from "react";
import { Dropdown, ButtonToolbar } from "rsuite";

const Content = ({ contents, users, type, editItem }) => {
  const canModerate = type === "petition";

  const getAuthor = (id) => {
    let name;
    users.forEach((user) => {
      if (String(user._id) === String(id)) {
        name = user.name;
      }
    });
    return name || "Unknown";
  };

  return (
    <div>
      <div>
        <table className="table-auto w-full ">
          <thead className="bg-gold text-white text-left rounded-md">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Title</th>
              <th className="p-3">Author</th>
              <th className="p-3">Status</th>
              <th className="p-3 w-44 text-center">Promotion <br /> Amount | Target</th>
              <th className="p-3">Views</th>
              <th className="p-3">Endorsement</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {contents?.map((item, index) => {
              const itemTitle = item?.title || item?.name || item?.caption || String(item?.body || "").slice(0, 20);
              const itemImage = item?.asset?.[0]?.url || "/logo.png";

              return (
              <tr key={index}>
                <td className="p-3">
                  {String(item?.createdAt || "").substring(0, 10)}
                </td>
                <td className="p-3">
                  {type === "petition" ? (
                    <a className="flex text-[#000]" href={`https://www.theplaint.org/campaigns/${item.slug}`} target="_blank" rel="noreferrer">
                      <img className="w-10 h-10 mr-2" src={itemImage} alt="" />
                      <span>{itemTitle}</span>
                    </a>
                  ) : (
                    <a className="flex text-[#000]" href={`https://www.theplaint.org/${type.charAt(0).toUpperCase() + type.slice(1)}?page=${item._id}`} target="_blank" rel="noreferrer">
                      <img className="w-10 h-10 mr-2" src={itemImage} alt="" />
                      <span>{itemTitle}</span>
                    </a>
                  )}
                </td>
                <td className="p-3">
                  <a className="text-[#000]" target="_blank" rel="noreferrer" href={`https://www.theplaint.org/user?page=${item?.author?._id || item.author}`}>
                    {getAuthor(item?.author?._id || item.author)}
                  </a>
                </td>
                <td className="p-3">
                  {String(item.status || "").toLowerCase() === "active" ? (
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
                  {(item?.numberOfPaidViewsCount ?? 0) + "  |  " + (item?.views?.length ?? 0)}
                </td>
                <td className="p-3">{item?.views?.length ?? 0}</td>
                <td className="p-3">{item?.endorsements?.length ?? 0}</td>
                <td className="p-3">
                  <ButtonToolbar>
                    <Dropdown
                      placement="rightStart"
                      title={<img className="h-4 w-4" src="/images/edit.svg" alt="" />}
                      noCaret
                    >
                      <Dropdown.Item>
                        <a href={`https://www.theplaint.org/promote?slug=${item._id}&view=true`} target="_blank" rel="noreferrer">
                          Promote
                        </a>
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <Dropdown title="Share">
                          <Dropdown.Item>
                            {type === "petition" ? (
                              <a href={`https://www.theplaint.org/campaigns/${item.slug}`} target="_blank" rel="noreferrer">
                                theplaint.org
                              </a>
                            ) : (
                              <a href={`https://www.theplaint.org/${type.charAt(0).toUpperCase() + type.slice(1)}?page=${item._id}`} target="_blank" rel="noreferrer">
                                theplaint.org
                              </a>
                            )}
                          </Dropdown.Item>
                          <Dropdown.Item>
                            {type === "petition" ? (
                              <a href={`https://www.theplaint.com/campaigns/${item.slug}`} target="_blank" rel="noreferrer">
                                theplaint.com
                              </a>
                            ) : (
                              <a href={`https://www.theplaint.com/${type.charAt(0).toUpperCase() + type.slice(1)}?page=${item._id}`} target="_blank" rel="noreferrer">
                                theplaint.com
                              </a>
                            )}
                          </Dropdown.Item>
                        </Dropdown>
                      </Dropdown.Item>
                      {canModerate && (
                        <>
                          <Dropdown.Item>
                            <p onClick={() => editItem(item._id, "Blocked")} className="cursor-pointer">
                              Toggle Status
                            </p>
                          </Dropdown.Item>
                          <Dropdown.Item>
                            <p onClick={() => editItem(item._id, "Active")} className="cursor-pointer">
                              Refresh Status
                            </p>
                          </Dropdown.Item>
                        </>
                      )}
                    </Dropdown>
                  </ButtonToolbar>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Content;
