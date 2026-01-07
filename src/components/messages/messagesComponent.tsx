import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Loader } from "rsuite";
import axios from "axios";
import ReactTimeAgo from "react-time-ago";
import { useAtom } from "jotai";
import {
    Send,
    Paperclip, Search,
    ChevronLeft,
    Trash2
} from "lucide-react";

import { adminAtom, accessAtom } from "@/atoms/adminAtom";
import { checkAccess } from "@/utils/accessUtils";
import { socket } from "@/pages/_app";

import AppointmentModal from "../modals/AppointmentModal";
import Online from "../Online";
import { MessagingTabs } from "../messagingTab";
import { getCookie } from "cookies-next";

const MessagesComponent = ({dataOwnerId}: {dataOwnerId: string}) => {
  const { query } = useRouter();

  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentUser, setAppointmentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(null);
  const [show, setShow] = useState(null);
  const [rating, setRating] = useState(0);
  const [star, setStar] = useState(false);
  const [filesPreview, setFilePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTypingData] = useState("");
  const [error, setError] = useState(null);
  const user = getCookie("user");
  const [userDeeds, setUserDeeds] = useState<any | null>(null);
  const [admin] = useAtom(adminAtom);
  const [access] = useAtom(accessAtom);


  const bottomRef = useRef(null);
  const uploadRef = useRef(null);

  const handleBookAppointment = (userId) => {
    setAppointmentUser(userId);
    setAppointmentModalOpen(true);
  };

  const getUser = async () => {
      try {
        const { data } = await axios.get(
          `/user/single/${user}`,
        );
        setUserDeeds(data.data.user)
      } catch (e) {
        console.error(e);
      }
    }

    useEffect(() => {
      getUser();
    }, []);

  const handleImage = async (e) => {
    try {
      if (filesPreview.length < 1) {
        const files = e.target.files;
        if (files?.[0]) {
          const file = files[0];
          if (file.size > 5 * 1024 * 1024)
            throw new Error("File size should not exceed 5MB");
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            if (reader.result) setFilePreview([reader.result]);
          };
        }
      }
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const getDm = () => {
    if (socket?.connected && query.page) {
      socket.emit(
        "get_dms",
        {
          userId: query.page,
          orgId: query.page,
        },
        (response) => {
          setMessages(response);
        }
      );
    }
  };

  useEffect(() => {
    if (socket.connected) {
        socket.on("dm", (updatedDm) => {
            if (show && updatedDm._id === show._id) {
                setShow(updatedDm);
            }
            getDm();
        });

        socket.on("dm_updated", () => {
            getDm();
        });
    }
    return () => {
        socket.off("dm");
        socket.off("dm_updated");
    };
}, [show, socket.connected]);

  const sendDm = async (id, from?) => {

    console.log(dataOwnerId)
    try {
      if (!message.trim() || !socket?.connected) return;
      setLoading(true);

      const payload = {
        to: id,
        from: from ? from : dataOwnerId,
        type: "text",
        text: message.trim(),
        dmType: "consumer-to-org",
        delegateData: {
          senderId: userDeeds?.id ?? null,
          senderName:  userDeeds? `${userDeeds?.firstName} ${userDeeds?.lastName}` : "Unknown",
          orgId: query.page,
          isDelegate: true,
        },
      };

      socket.emit("send_dm", payload, (response) => {
        setMessage("");
        setShow(response);
        getDm();
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendFile = (id) => {
    if (filesPreview.length > 0 && socket?.connected) {
      setLoading(true);
      const payload = {
        to: id,
        from: query.page,
        type: "file",
        file: filesPreview[0],
        dmType: "consumer-to-org",
      };
      socket.emit("send_dm", payload, (response) => {
        setFilePreview([]);
        setShow(response);
        setLoading(false);
        getDm();
      });
    }
  };

  const handleDeleteChat = (id) => {
    if (
      !checkAccess(access, "Delete Messages") &&
      !checkAccess(access, "Manage Messages")
    )
      return alert("Access Denied");
    socket.emit("delete_dm", { dmId: id, userId: query.page }, () => getDm());
  };

  const handleMarkRead = (id, msgId) => {
    if (socket?.connected && query.page) {
      socket.emit("mark_as_read", { dmId: id, userId: query.page }, () => {
        socket.emit(
          "read_message",
          { messageId: msgId, dmId: id, userId: query.page },
          () => getDm()
        );
      });
    }
  };

  useEffect(() => {
    getDm();
    const found = admin?.orgOperating?.find(
      (single) => single._id === query.page
    );
    setActive(found);
  }, [query.page, admin]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [show]);

  useEffect(() => {
    if (socket) {
      socket.on("typing", (data) => {
        setTypingData(data);
        setTimeout(() => setTypingData(""), 4000);
      });
    }
  }, []);

  const sendTyping = (id) => {
    if (socket?.connected)
      socket.emit("typing", { to: id, userName: active?.name || "User" });
  };

  return (
    <div>
      <MessagingTabs />
      <div className="flex h-[calc(100vh-160px)] bg-white border rounded-xl overflow-hidden shadow-sm">
        {error && (
          <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-[100] animate-bounce">
            {error}
          </div>
        )}

        {/* --- CONVERSATION LIST (LEFT) --- */}
        <div
          className={`w-full md:w-[350px] border-r flex flex-col bg-slate-50 ${
            show ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 bg-white border-b">
            <h2 className="text-xl font-bold text-slate-800">Messages</h2>
            <div className="mt-4 flex items-center gap-3 p-2 bg-primary/10 border border-orange-100 rounded-lg">
              <img
                src={active?.image}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                alt=""
              />
              <div className="truncate">
                <p className="text-xs text-orange-600 font-medium">Acting as</p>
                <p className="text-sm font-bold truncate">{active?.name}</p>
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Search chats..."
                onChange={(e) => {
                  /* legacy search logic here */
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {messages.map((item, index) => {
              const isUnread =
                item.unread === true ||
                (item.messages[item.messages.length - 1]?.received === false &&
                  item.messages[item.messages.length - 1]?.to === query.page);
              const otherUser =
                item.users[0]?._id === query.page || item.users[0]?._id === dataOwnerId
                  ? item.users[1]
                  : item.users[0];

              return (
                <div
                  key={index}
                  onClick={() => {
                    setShow(item);
                    handleMarkRead(
                      item.id,
                      item.messages[item.messages.length - 1]?._id
                    );
                  }}
                  className={`flex p-4 border-b cursor-pointer transition-all hover:bg-white ${
                    show?.id === item.id
                      ? "bg-white border-l-4 border-l-orange-500 shadow-sm"
                      : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={otherUser?.image}
                      className="w-12 h-12 rounded-full object-cover"
                      alt=""
                    />
                    <div className="absolute bottom-0 right-0">
                      <Online id={otherUser?._id} />
                    </div>
                  </div>
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <p
                        className={`text-sm truncate ${
                          isUnread
                            ? "font-bold text-slate-900"
                            : "text-slate-600"
                        }`}
                      >
                        {otherUser?.name}
                      </p>
                      <span className="text-[10px] text-slate-400 truncate">
                        {item.updatedAt && (
                          <ReactTimeAgo
                            date={new Date(item.updatedAt)}
                            locale="en-US"
                          />
                        )}
                      </span>
                      {/* Show if this is a delegated chat */}
                      {item.assignedOrgs?.includes(query.page) && (
                        <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase font-bold">
                          Delegated
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs truncate mt-1 ${
                        isUnread
                          ? "text-slate-800 font-medium"
                          : "text-slate-400"
                      }`}
                    >
                      {item.messages[item.messages.length - 1]?.text}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="w-2 h-2 bg-primary rounded-full self-center ml-2 shadow-sm shadow-orange-200"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- CHAT VIEW (RIGHT) --- */}
        <div
          className={`flex-1 flex flex-col bg-slate-50 ${
            !show ? "hidden md:flex items-center justify-center" : "flex"
          }`}
        >
          {show ? (
            <>
              {/* Header */}
              <div className="p-4 bg-white border-b flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <button className="md:hidden" onClick={() => setShow(null)}>
                    <ChevronLeft />
                  </button>
                  <div className="relative">
                    <img
                      src={
                        show?.users[0]?._id === query.page || show?.users[0]?._id === dataOwnerId
                          ? show?.users[1]?.image
                          : show?.users[0]?.image
                      }
                      className="w-10 h-10 rounded-full object-cover"
                      alt=""
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {show?.users[0]?._id === query.page || show?.users[0]?._id === dataOwnerId
                        ? show?.users[1]?.name
                        : show?.users[0]?.name}
                    </p>
                    <p className="text-[11px] text-orange-500 font-medium">
                      {typing || "Online"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* <button onClick={() => handleBookAppointment(show?.users[0]?._id === query.page ? show?.users[1]?._id : show?.users[0]?._id)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                                    <Star size={18} />
                                </button> */}
                  <button
                    onClick={() => handleDeleteChat(show.id)}
                    className="p-2 flex gap-x-2 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                    Delete Chat
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F1F5F9]">
                {show?.messages?.map((item, index) => {
                  const isMe = item?.from === query.page || item?.from === dataOwnerId;
                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${
                          isMe
                            ? "bg-[#d1d5db] text-black rounded-tr-none"
                            : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                        }`}
                      >
                        {/* --- ADDED SENDER NAME --- */}
                        {item.metadata?.isDelegate && (
                          <p className="text-[9px] font-bold opacity-50 mb-1 uppercase tracking-wider">
                            {isMe
                              ? `Me (${item.metadata.senderName})`
                              : item.metadata.senderName}
                          </p>
                        )}

                        {item.file && (
                          <img
                            src={item.file}
                            className="rounded-lg mb-2 max-h-60 w-full object-cover"
                          />
                        )}
                        <p className="leading-relaxed">{item.text}</p>

                        <div
                          className={`text-[10px] mt-1 flex justify-end gap-1 opacity-70`}
                        >
                          {isMe && (item.received ? "Read" : "Sent")}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input Footer */}
              <div className="p-4 bg-white border-t">
                {filesPreview.length > 0 && (
                  <div className="mb-2 p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                    <img
                      src={filesPreview[0]}
                      className="h-12 w-12 rounded object-cover"
                      alt="preview"
                    />
                    <button
                      onClick={() => setFilePreview([])}
                      className="text-xs text-red-500 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <div className="flex bg-slate-100 rounded-2xl p-1 items-center">
                    <button
                      onClick={() => uploadRef.current?.click()}
                      className="p-2 text-slate-500 hover:text-orange-500 transition-colors"
                    >
                      <Paperclip size={20} />
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={uploadRef}
                    className="hidden"
                    onChange={handleImage}
                  />

                  <div className="flex-1 relative">
                    <textarea
                      className="w-full bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none resize-none min-h-[48px]"
                      placeholder="Write your message..."
                      rows={1}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onFocus={() => {
                        const rid =
                          show?.users?.[0]?._id === query.page || show?.users?.[0]?._id === dataOwnerId
                            ? show?.users?.[1]?._id
                            : show?.users?.[0]?._id;
                        if (rid) sendTyping(rid);
                      }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      const rid =
                        show?.users?.[0]?._id === query.page || show?.users?.[0]?._id === dataOwnerId
                          ? show?.users?.[1]?._id
                          : show?.users?.[0]?._id;
                      filesPreview.length > 0 ? sendFile(rid) : sendDm(rid, show.type === 'consumer-to-org' ? query.page : undefined);
                    }}
                    disabled={
                      loading || (!message.trim() && filesPreview.length === 0)
                    }
                    className="p-3 bg-primary hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-2xl transition-all shadow-md active:scale-95"
                  >
                    {loading ? <Loader /> : <Send size={20} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Your Messages
              </h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
                Select a chat to view conversations or contact your connections.
              </p>
            </div>
          )}
        </div>

        <AppointmentModal
          open={appointmentModalOpen}
          handleClick={() => setAppointmentModalOpen(false)}
          to={appointmentUser}
          data={undefined}
        />
      </div>
    </div>
  );
};

export default MessagesComponent;
