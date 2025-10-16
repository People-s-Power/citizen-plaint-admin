import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import { Dropdown, Loader, Popover, Whisper } from "rsuite"
import Link from "next/link"
import axios from "axios"
import { io } from "socket.io-client"
import ReactTimeAgo from "react-time-ago"
import Online from "./Online"
import { socket } from "../pages/_app"

import { useAtom } from 'jotai';
import { adminAtom } from '@/atoms/adminAtom';


const MessagesComponent = () => {
    const { query } = useRouter();
    const [admin] = useAtom(adminAtom);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [active, setActive] = useState(null);
    const [show, setShow] = useState(null);
    const [rating, setRating] = useState(0);
    const [star, setStar] = useState(false);
    const [orgs, setOrgs] = useState([]);
    const [orgId, setOrgId] = useState("");
    const uploadRef = useRef(null);
    const [filesPreview, setFilePreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const [victory, setVictory] = useState(false);
    const [sigUser, setUser] = useState(null);
    const [typing, setTypingData] = useState("");
    const [error, setError] = useState(null);

    // const makeTestimony = () => setVictory(!victory);

    const handleImage = async (e) => {
        try {
            if (filesPreview.length < 1) {
                const files = e.target.files;
                if (files && files.length > 0) {
                    const file = files[0];
                    // Check file size (5MB limit)
                    if (file.size > 5 * 1024 * 1024) {
                        throw new Error('File size should not exceed 5MB');
                    }
                    // Check file type
                    if (!file.type.startsWith('image/')) {
                        throw new Error('Only image files are allowed');
                    }

                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onloadend = () => {
                        if (reader.result) {
                            setFilePreview([...filesPreview, reader.result]);
                        }
                    };
                    reader.onerror = () => {
                        throw new Error('Failed to read file');
                    };
                }
            }
        } catch (error) {
            setError(error.message);
            setTimeout(() => setError(null), 3000);
        }
    }


    // useQuery(GET_ORGANIZATIONS, {
    //     variables: { ID: user?.id },
    //     client: apollo,
    //     onCompleted: (data) => {
    //         console.log(data.getUserOrganizations)
    //         setOrgs(data.getUserOrganizations)
    //     },
    //     onError: (err) => {
    //         // console.log(err)
    //     },
    // })

    // const { refetch } = useQuery(GET_ORGANIZATION, {
    //     variables: { ID: orgId },
    //     client: apollo,
    //     onCompleted: (data) => {
    //         setOrgs([...orgs, data.getOrganzation])
    //     },
    //     onError: (err) => {
    //         console.log(err.message)
    //     },
    // })

    const deleteChat = (id) => {
        if (socket && socket.connected) {
            socket.emit('delete_dm', {
                dmId: id,
                userId: query.page,
            }, response => {
                getDm();
            });
        }
    }
    // const getSingle = () => {
    //     try {
    //         axios.get(`/user/single/${user}`).then(function (response) {
    //             console.log(response.data.user.orgOperating)
    //             response?.data.user.orgOperating.map((operating) => {
    //                 setOrgId(operating)
    //                 setOrgs(response?.data.user.orgOperating)
    //                 refetch()
    //             })
    //         })
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    const sendFile = (id) => {
        if (filesPreview.length > 0 && socket && socket.connected) {
            setLoading(true);
            const payload = {
                to: id,
                from: query.page,
                type: "file",
                file: filesPreview[0],
                dmType: active?.__typename === undefined ? "consumer-to-consumer" : "consumer-to-org",
            };
            socket.emit("send_dm", payload, (response) => {
                setFilePreview([]);
                setShow(response);
                setLoading(false);
                if (query.page !== undefined) {
                    window.location.href = "/messages";
                }
            });
        }
    }
    const sendDm = async (id) => {
        try {
            if (!message.trim()) {
                throw new Error('Message cannot be empty');
            }

            if (!socket?.connected) {
                throw new Error('Not connected to server');
            }

            setLoading(true);
            const payload = {
                to: id,
                from: query.page,
                type: "text",
                text: message.trim(),
                dmType: "consumer-to-org",
                timestamp: new Date().toISOString()
            };

            socket.emit("send_dm", payload, (response) => {
                if (response.error) {
                    throw new Error(response.error);
                }
                setMessage("");
                setShow(response);
                getDm(); // Refresh messages
                // if (query.page !== undefined) {
                //     router.push("/messages");
                // }
            });
        } catch (error) {
            setError(error.message);
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    }

    // useEffect(() => {
    //     getSingle();
    // }, [query.page, orgs]);

    const getDm = () => {
        if (socket && socket.connected && query.page) {
            socket.emit("get_dms", query.page, (response) => {
                // console.log('dms' + response);
                setMessages(response.reverse());
            });
        }
    }

    // useEffect(() => {
    //     if (query.page) {
    //         try {
    //             axios.get(`/user/single/${user}`).then(function (response) {
    //                 setUser(response.data.user);
    //                 setActive(response.data.user);
    //             });
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     }
    // }, [])

    useEffect(() => {
        getDm()
        const found = admin.orgOperating.find(single => single._id === query.page);
        console.log(found)
        setActive(found)

    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [show])


    const blockUser = (id) => {
        if (socket && socket.connected && query.page) {
            socket.emit(
                "block_message",
                {
                    messageId: id,
                    userId: query.page
                },
                (response) => {
                    setShow(null);
                    getDm();
                }
            );
        }
    }

    const unblockUser = (id) => {
        if (socket && socket.connected && query.page) {
            socket.emit(
                "unblock_message",
                {
                    messageId: id,
                    userId: query.page
                },
                (response) => {
                    setShow(null);
                    getDm();
                }
            );
        }
    }

    const readMessage = (id, msg) => {
        if (socket && socket.connected && query.page) {
            socket.emit('read_message', {
                messageId: msg,
                dmId: id,
                userId: query.page,
            }, (response) => {
                getDm();
            });
        }
    }

    const deleteDm = (id, msg) => {
        if (socket && socket.connected && query.page) {
            socket.emit('delete_message', {
                messageId: msg,
                dmId: id,
                userId: query.page,
            }, response => {
                getDm();
            });
        }
    }

    const resolve = (id) => {
        if (star === false) {
            setStar(true);
            return;
        }
        if (socket && socket.connected && query.page) {
            socket.emit(
                "send_reviews",
                {
                    authorId: query.page,
                    messageId: id,
                    rating: rating,
                },
                (response) => {
                    // handle response
                }
            );
        }
        setStar(false);
    }

    const markUnRead = (id) => {
        if (socket && socket.connected && query.page) {
            socket.emit('mark_as_unread', {
                dmId: id,
                userId: query.page,
            }, (response) => {
                getDm();
            });
        }
    }
    const markRead = (id, msg) => {
        if (socket && socket.connected && query.page) {
            socket.emit('mark_as_read', {
                dmId: id,
                userId: query.page,
            }, (response) => {
                readMessage(id, msg);
            });
        }
    }
    // item.users[0]._id === active.id ? item.users[1].name : item.users[0].name
    const search = (value) => {
        if (value === "") return getDm();
        const matchingStrings = [];
        for (const string of messages) {
            if (string.users[0]._id === query.page ? string.users[1].name.toLowerCase().includes(value) : string.users[0].name.toLowerCase().includes(value)) {
                matchingStrings.push(string);
            }
        }
        setMessages(matchingStrings);
    }

    const sendTyping = (id) => {
        if (socket && socket.connected && query.page) {
            socket.emit('typing', {
                to: id,
                userName: sigUser?.name || "User"
            }, response => {
                // handle response
            });
        }
    }

    const setTyping = () => {
        if (socket) {
            socket.on('typing', function (data) {
                setTypingData(data);
                setTimeout(() => setTypingData(''), 4000);
            });
        }
    }

    useEffect(() => {
        setTyping()
    })

    // const speaker = (
    //     <Popover>
    //         <div className="flex m-1 cursor-pointer">
    //             <img src={sigUser?.image} className="w-10 h-10 rounded-full mr-4" alt="" />
    //             <div className="text-sm my-auto">{sigUser?.name}</div>
    //         </div>
    //         {orgs !== null
    //             ? orgs.map((org, index) => (
    //                 <div
    //                     key={index}
    //                     className="flex m-1 cursor-pointer"
    //                 >
    //                     <img src={org?.image} className="w-8 h-8 rounded-full mr-4" alt="" />
    //                     <div className="text-sm my-auto">{org?.name}</div>
    //                 </div>
    //             ))
    //             : null}
    //     </Popover>
    // )

    return (
        <div className="lg:flex sm:p-6">

            {error && (
                <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
                    {error}
                </div>
            )}
            <div className="lg:w-[40%] overflow-y-auto h-full">
                <div className="text-lg p-3">Messages</div>
                {/* {orgs && ( */}
                <div className="my-2 bg-warning p-2 rounded-md">
                    {/* <Whisper placement="bottom" trigger="click" speaker={speaker}> */}
                    <div className="flex justify-between ">
                        <div className="flex cursor-pointer">
                            <img src={active?.image} className="w-10 h-10 rounded-full mr-4" alt="" />
                            <div className="text-sm my-auto">{active?.name}</div>
                        </div>
                        <div className="my-auto">
                            {/* <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#ffffff" className="bi bi-caret-down-fill" viewBox="0 0 16 16">
                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                            </svg> */}
                        </div>
                    </div>
                    {/* </Whisper> */}
                </div>
                {/* )} */}
                <input type="text" className="p-2 border rounded-md w-full" onChange={(e) => search(e.target.value)} placeholder="Search Messages" />
                {messages &&
                    messages.map((item, index) => (
                        <div key={index} className={
                            item.type === "consumer-to-consumer" ?
                                (item.unread === true || (item.messages[item.messages.length - 1]?.received === false && item.messages[item.messages.length - 1]?.to === query.page))
                                    ? "flex p-3 bg-gray-100 cursor-pointer"
                                    : "flex p-3 hover:bg-gray-100 w-full cursor-pointer"
                                : (item.unread === true || (item.messages[item.messages.length - 1]?.received === false && item.messages[item.messages.length - 1]?.to === query.page))
                                    ? "flex p-3 bg-gray-100 cursor-pointer"
                                    : "flex p-3 hover:bg-gray-100 w-full cursor-pointer"}>


                            <div onClick={() => { setShow(item); readMessage(item.id, item.messages[item.messages.length - 1]._id); markRead(item.id, item.messages[item.messages.length - 1]._id) }}
                                className={"w-full flex"}
                            >
                                {
                                    item.type === "consumer-to-consumer" ? (
                                        <img
                                            src={item.users[0]?._id === query.page ? item.users[1]?.image : item.users[0]?.image}
                                            className="w-10 h-10 rounded-full my-auto"
                                            alt=""
                                        />
                                    ) : (
                                        <img
                                            src={item.users[0]?._id === query.page ? item.users[1]?.image : item.users[0]?.image}
                                            className="w-10 h-10 rounded-full my-auto"
                                            alt=""
                                        />
                                    )
                                }

                                {
                                    item.type === "consumer-to-consumer" ? (
                                        <div className="w-6 my-auto mx-auto">
                                            {(item.unread === true || (item.messages[item.messages.length - 1]?.received === false &&
                                                item.messages[item.messages.length - 1]?.to === query.page)) && (
                                                    <div className="bg-warning mx-auto w-2 h-2 my-auto rounded-full"></div>
                                                )}
                                        </div>
                                    ) : (
                                        <div className="w-6 my-auto mx-auto">
                                            {(item.unread === true || (item.messages[item.messages.length - 1]?.received === false &&
                                                item.messages[item.messages.length - 1]?.to === query.page)) && (
                                                    <div className="bg-warning mx-auto w-2 h-2 my-auto rounded-full"></div>
                                                )}
                                        </div>
                                    )
                                }

                                <div className="w-[80%] ml-4">
                                    <div className="flex">
                                        <Online id={item.users[0]?._id === query.page ? item.users[1]?._id : item.users[0]?._id} />
                                        {
                                            item.type === "consumer-to-consumer" ? (
                                                <div className="text-base font-bold">
                                                    {item.users[0]?._id === query.page ? item.users[1]?.name : item.users[0]?.name}
                                                </div>
                                            ) : (
                                                <div className="text-base font-bold">
                                                    {item.users[0]?._id === query.page ? item.users[1]?.name : item.users[0]?.name}
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div>
                                        <div className="text-sm">
                                            <strong>
                                                {item.messages[item.messages.length - 1]?.type === "sponsored"
                                                    ? "Expert Needed"
                                                    : item.messages[item.messages.length - 1]?.type === "advert"
                                                        ? "Promoted"
                                                        : null
                                                }
                                            </strong>
                                            {" "}
                                            {item.messages[item.messages.length - 1]?.text?.substring(0, 50)}
                                            {item.messages[item.messages.length - 1]?.file ? " file" : ""}
                                        </div>
                                        <ReactTimeAgo date={new Date(item?.updatedAt || Date.now())} />
                                    </div>
                                </div>
                            </div>
                            <Dropdown placement="leftStart" title={<img className="h-6 w-6" src="/images/edit.svg" alt="" />} noCaret>
                                <Dropdown.Item>
                                    <span onClick={() => deleteChat(item.id)}>Delete</span>
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <span onClick={() => markUnRead(item.id)}>Mark Unread</span>
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <span onClick={() => markRead(item.id, item.messages[item.messages.length - 1]._id)}>Mark Read</span>
                                </Dropdown.Item>
                            </Dropdown>
                        </div>
                    ))}
            </div>
            <div className={`lg:w-[45%] shadow-md lg:fixed lg:right-32 h-full sm:overflow-auto sm:mt-4  ${show !== null || query.page !== undefined ? 'sm:absolute sm:top-20 bg-white z-10 sm:left-0 sm:h-screen sm:w-screen' : 'sm:hidden'}`}>
                <div className="lg:hidden cursor-pointer p-4" onClick={() => setShow(null)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-left-circle-fill" viewBox="0 0 16 16">
                        <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z" />
                    </svg>
                </div>
                {show === null && query.page !== undefined ? (
                    <div className="text-center text-sm">
                        {sigUser && <div className="text-center">
                            <div className="flex justify-center mb-3">
                                <img src={sigUser.image} className="w-12 h-12 rounded-full" alt="" />
                                <div className="ml-4 my-auto">
                                    <div className="text-sm">{sigUser.name}</div>
                                </div>
                            </div>
                            <p className="text-xs">{sigUser.description}</p>
                        </div>}

                        <p className="text-sm text-center text-warning py-1">{typing}</p>
                    </div>
                ) : (
                    show &&
                    <div className="lg:h-[60%] overflow-y-auto">
                        <div className="p-2 sm:hidden text-center text-xs text-gray-400 border-b border-gray-200">
                            <ReactTimeAgo date={new Date(show?.createdAt)} />
                        </div>
                        <div className="p-3">
                            <div className="flex mb-3">
                                {
                                    show?.type === "consumer-to-consumer" ? (
                                        <img
                                            src={show?.users[0]?._id === query.page ? show?.users[1]?.image : show?.users[0]?.image}
                                            className="w-12 h-12 rounded-full"
                                            alt=""
                                        />
                                    ) : (
                                        <img
                                            src={show?.users[0]?._id === query.page ? show?.users[1]?.image : show?.users[0]?.image}
                                            className="w-12 h-12 rounded-full"
                                            alt=""
                                        />
                                    )
                                }
                                <div className="ml-4 my-auto">
                                    {
                                        show?.type === "consumer-to-consumer" ? (
                                            <div className="text-sm">
                                                {show?.users[0]?._id === query.page ? show?.users[1]?.name : show?.users[0]?.name}
                                            </div>
                                        ) : (
                                            <div className="text-sm">
                                                {show?.users[0]?._id === query.page ? show?.users[1]?.name : show?.users[0]?.name}
                                            </div>
                                        )
                                    }
                                    <p className="text-sm text-center text-warning py-1">{typing}</p>
                                    <div className="text-xs">
                                        <ReactTimeAgo date={new Date(show?.updatedAt || Date.now())} />
                                    </div>
                                </div>
                            </div>
                            {show?.messages?.map((item, index) =>
                                item?.from === query.page ? (
                                    <div key={index} className="flex">
                                        <div className="text-xs my-2 p-1 bg-gray-200 w-[80%] ml-auto rounded-md flex justify-between">
                                            {item?.text}
                                            <img src={item?.file} alt="" />
                                            {
                                                item?.delivered === true && item?.received === false ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#F7A607" className="bi bi-check2" viewBox="0 0 16 16">
                                                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                                                </svg> : item?.delivered === true && item?.received === true ?
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#F7A607" className="bi bi-check2-all" viewBox="0 0 16 16">
                                                        <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z" />
                                                        <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z" />
                                                    </svg> : null
                                            }
                                        </div>
                                        <Dropdown placement="leftStart" title={<img className="h-6 w-6" src="/images/edit.svg" alt="" />} noCaret>
                                            <Dropdown.Item>
                                                <span onClick={() => deleteDm(show.id, item._id)}>Delete</span>
                                            </Dropdown.Item>
                                        </Dropdown>
                                    </div>
                                ) : (
                                    <div key={index} className="text-xs w-[80%] my-2">
                                        {item.text}
                                        <img src={item?.file} alt="" />
                                    </div>
                                )
                            )}
                            <div ref={bottomRef} />
                        </div>
                    </div>
                )}
                {
                    show?.messages[show.messages.length - 1].type === "advert" ? <div className="fixed bottom-5 text-center w-[45%] bg-white">
                        <a href={show.messages[show.messages.length - 1].link}>
                            <button className="p-2 bg-warning w-44 mx-auto text-white rounded-md">Learn More</button>
                        </a>
                    </div> :
                        show?.blocked !== true ? (show !== null ? (
                            <div className="fixed bottom-0 lg:w-[45%] sm:left-0 w-full bg-white ">
                                <div className="flex relative">
                                    <textarea
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full h-32 text-sm p-2 border bg-gray-200 border-white"
                                        placeholder="Write a message"
                                        value={message}
                                        onFocus={() => {
                                            const recipientId = show?.users?.[0]?._id === query.page
                                                ? show?.users?.[1]?._id
                                                : show?.users?.[0]?._id;
                                            if (recipientId) sendTyping(recipientId);
                                        }}
                                    ></textarea>
                                    <Dropdown placement="topEnd" title={<img className="h-6 w-6 text-sm" src="/images/edit.svg" alt="" />} noCaret>
                                        {show?.type === "customer-org" && (
                                            <Dropdown.Item>
                                                <span onClick={() => resolve(query.page)}>Resolve</span>
                                            </Dropdown.Item>
                                        )}
                                        <Dropdown.Item>
                                            <span onClick={() => makeTestimony()}>Make a Testimony</span>
                                        </Dropdown.Item>
                                        <Link href={`/report?page=${show?.participants[0] || query.page}`}>
                                            <Dropdown.Item>Report User/Ad</Dropdown.Item>
                                        </Link>
                                        <Dropdown.Item>
                                            <span onClick={() => blockUser(show?.id)}>Block User</span>
                                        </Dropdown.Item>
                                    </Dropdown>
                                    {star === true && (
                                        <div className="absolute z-10 top-0 left-0 w-full bg-white h-full text-center">
                                            <p className="text-xl">Rate the performance of this Organization</p>
                                            <div className="flex my-2 justify-center cursor-pointer">
                                                <div onClick={() => setRating(1)} className="mx-2">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        fill={rating >= 1 ? "#F7A607" : "#D9D9D9"}
                                                        className="bi bi-star-fill"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                    </svg>
                                                </div>
                                                <div onClick={() => setRating(2)} className="mx-2">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        fill={rating >= 2 ? "#F7A607" : "#D9D9D9"}
                                                        className="bi bi-star-fill"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                    </svg>
                                                </div>
                                                <div onClick={() => setRating(3)} className="mx-2">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        fill={rating >= 3 ? "#F7A607" : "#D9D9D9"}
                                                        className="bi bi-star-fill"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                    </svg>
                                                </div>
                                                <div onClick={() => setRating(4)} className="mx-2">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        fill={rating >= 4 ? "#F7A607" : "#D9D9D9"}
                                                        className="bi bi-star-fill"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                    </svg>
                                                </div>
                                                <div onClick={() => setRating(5)} className="mx-2">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        fill={rating >= 5 ? "#F7A607" : "#D9D9D9"}
                                                        className="bi bi-star-fill"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="text-xm">“ Give reasons why you are rating “</p>
                                            <div onClick={() => resolve(show.id)} className="text-sm text-warning cursor-pointer px-3 float-right mb-10">
                                                Send
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {star === false ? (
                                    <div className="flex justify-between border-t border-gray-200 p-3">
                                        <div className="flex w-20 justify-between">
                                            <img onClick={() => uploadRef.current?.click()} className="w-4 h-4 my-auto  cursor-pointer" src="/images/home/icons/ic_outline-photo-camera.svg" alt="" />
                                            <img onClick={() => uploadRef.current?.click()} className="w-4 h-4 my-auto  cursor-pointer" src="/images/home/icons/charm_camera-video.svg" alt="" />
                                            <img className="w-4 h-4 my-auto  cursor-pointer" src="/images/home/icons/bi_file-earmark-arrow-down.svg" alt="" />
                                        </div>
                                        <input type="file" ref={uploadRef} className="d-none hidden" onChange={handleImage} />
                                        <div className="flex">
                                            {filesPreview.map((file, index) => (
                                                <div key={index} className="relative w-20 h-20 mx-1">
                                                    <img src={file} className="w-12 h-12" alt="" />
                                                </div>
                                            ))}
                                        </div>
                                        {
                                            filesPreview.length >= 1 ? (
                                                <div onClick={() => {
                                                    const recipientId = show?.users?.[0]?._id === query.page
                                                        ? show?.users?.[1]?._id
                                                        : show?.users?.[0]?._id;
                                                    if (recipientId) sendFile(recipientId);
                                                }} className="text-sm text-warning cursor-pointer">
                                                    {loading ? <Loader /> : "Send"}
                                                </div>
                                            ) : (
                                                <div onClick={() => {
                                                    const recipientId = show?.users?.[0]?._id === query.page
                                                        ? show?.users?.[1]?._id
                                                        : show?.users?.[0]?._id;
                                                    if (recipientId) sendDm(recipientId);
                                                }} className="text-sm text-warning cursor-pointer">
                                                    {loading ? <Loader /> : "Send"}
                                                </div>
                                            )
                                        }
                                        {/* <div onClick={() => sendDm(show?.participants[0] || query.page)} className="text-sm text-warning cursor-pointer">
												Send
											</div> 

                                        */}
                                    </div>
                                ) : null}
                            </div>
                        ) : <div className="p-4 text-center">
                            <img className="w-40 mx-auto h-40 sm:hidden" src="/images/logo1.jpg" alt="" />
                            <h5 className="my-4 sm:hidden">Chat with your connections.</h5>
                            <p className="sm:hidden">Go to My Connections and followers or following to send message.</p>
                            {/* <Link href={'/connection?page=followers'}>
                                <button className="bg-warning px-4 text-white p-2 my-4 rounded-sm">chat with connections</button>
                            </Link> */}
                        </div>) : (<div className="text-center text-gray-400">This user has been blocked {show.blockedBy === query.page ? <span className="text-warning cursor-pointer" onClick={() => unblockUser(show?.id)}>Unblock</span> : null} </div>)
                }
            </div>
            {/* <CreateVictories open={victory} handelClick={makeTestimony} victory={null} /> */}
        </div>
    )
}

export default MessagesComponent
