import React, { Fragment, useEffect, useState } from 'react';
import { getCookie } from "cookies-next";
import axios from "axios";
import HeaderComp from '@/components/HeaderComp';
import Link from 'next/link';
import router, { useRouter } from "next/router"
import cookie from "js-cookie"
import StartPetition from '@/components/modals/StartPetition';
import CreatePost from '@/components/modals/CreatePost';
import CreateAdvert from '@/components/modals/CreateAdvert';
import CreateEvent from '@/components/modals/CreateEvent';
import CreateVictories from '@/components/modals/CreateVictories';
import Table from '@/components/Table';
import Tasks from '@/components/Tasks';
import Reviews from '@/components/modals/Reviews';
// import MessagesComponent from '@/components/MessageComponent';
import MessagingPicker from '@/components/messagingPicker';
import AppointmentComp from '@/components/AppointmentComp';
import { SERVER_URL } from '../_app';
import { useAtom } from 'jotai';
import { accessAtom } from '../../atoms/adminAtom';
import { checkAccess } from '@/utils/accessUtils';

const Professionals = () => {
  const [userDeeds, setUser] = useState()
  const [access, setAccess] = useAtom(accessAtom);
  const [orgs, setOrgs] = useState([])
  const user = getCookie("user");
  const { query } = useRouter()
  // Defer default active tab until access is known to avoid showing 'summary' by default
  const [active, setActive] = useState(null);
  // determine manage dynamically from access; start as null until access is known
  const [manage, setManage] = useState(null);
  const [activities, setActivities] = useState([])
  const [users, setUsers] = useState([])

  const [post, setPosts] = useState([])
  const [event, setEvents] = useState([])
  const [advert, setAdverts] = useState([])
  const [petition, setPetitions] = useState([])
  const [update, setUpdates] = useState([])
  const [victory, setVictory] = useState([])
  const [invite, setInvite] = useState(false)
  const [tasks, setTasks] = useState([])
  const [orgInvites, setOrgInvites] = useState([])


  const [open, setOpen] = useState(false)
  const [openPetition, setOpenPetition] = useState(false)
  const [openPost, setOpenPost] = useState(false)
  const [openAdvert, setOpenAdvert] = useState(false)
  const [openEvent, setOpenEvent] = useState(false)
  const [openVictory, setOpenVictory] = useState(false)
  const [processingInvitation, setProcessingInvitation] = useState(null)

  const UploadTrigger = () => {
    if (manage === "petition") {
      // only allow starting a petition when user has Make Petitions permission
      if (checkAccess(access, 'Make Petitions')) {
        setOpenPetition(true)
      } else {
        alert('You do not have permission to create petitions.')
      }
    } else if (manage === "advert") {
      setOpenAdvert(true)
    } else if (manage === "post") {
      // allow creating posts only when user has Make Posts permission
      if (checkAccess(access, 'Make Posts') || checkAccess(access, 'Create Posts')) {
        setOpenPost(true)
      } else {
        alert('You do not have permission to create posts.')
      }
    } else if (manage === "event") {
      // allow creating events only when user has Create Events permission
      if (checkAccess(access, 'Create Events') || checkAccess(access, 'Make Events')) {
        setOpenEvent(true)
      } else {
        alert('You do not have permission to create events.')
      }
    } else if (manage === "victory") {
      setOpenVictory(true)
    }
  }

  // Safe mapping for Table contents to avoid eval
  const contentMap = {
    post,
    petition,
    event,
    advert,
    victory,
    update
  }

  // compute a sensible default for manage once access is loaded
  useEffect(() => {
    if (manage !== null) return; // already set

    const pickDefault = () => {
      if (checkAccess(access, 'View Posts')) return 'post'
      if (checkAccess(access, 'View Petitions')) return 'petition'
      if (checkAccess(access, 'View Events')) return 'event'
      // if (checkAccess(access, 'View Adverts')) return 'advert'
      // if (checkAccess(access, 'View Victories')) return 'victory'
      // if (checkAccess(access, 'View Updates')) return 'update'

      return 'petition'
    }

    const def = pickDefault()
    setManage(def)
  }, [access, manage])

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

  const getUser = async () => {
    try {
      const { data } = await axios.get(
        `/user/single/${user}`,
      );
      setUser(data.data.user)
      // Only set orgs from user data, don't append
      if (data.data.user.orgOperating) {
        setOrgs(data.data.user.orgOperating)
      }
      console.log(data.data)
    } catch (e) {
      console.log(e);
    }
  }

  const getUsers = async () => {
    try {
      const { data } = await axios.post(
        `${SERVER_URL}/api/v5/organization/user/organizations`,
        { userId: user }
      );
      console.log(data)
      setOrgInvites(data)
      // setUsers(data.data.users)
    } catch (e) {
      console.log(e);
    }
  }

  const getAuthor = (id) => {
    var name
    users.map((user) => {
      if (user._id === id) {
        name = user
      }
    })
    return name
  }


  const getActivities = async () => {
    try {
      const { data } = await axios.patch("auth/activities?page=1&limit=10", {
        userId: user
      })
      setActivities(data.data.activities.activities)
      // console.log(data.data.activities.activities)
    } catch (e) {
      console.log(e)
    }
  }

  const getOrgs = async () => {
    try {
      const { data } = await axios.get(`${SERVER_URL}/api/v5/organization/invitations/pending/${user}`);
      console.log('Pending invitations:', data);
      // Append pending invitations to existing orgs
      if (data && Array.isArray(data)) {
        setOrgs(prevOrgs => {
          // Filter out duplicates based on _id
          const existingIds = new Set(prevOrgs.map(org => org._id));
          const newOrgs = data.filter(org => !existingIds.has(org._id));
          return [...prevOrgs, ...newOrgs];
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  const handleAcceptInvitation = async (invitationId) => {
    if (processingInvitation) return;

    try {
      setProcessingInvitation(invitationId);
      const { data } = await axios.post(`${SERVER_URL}/api/v5/organization/invitations/accept`, {
        orgId: invitationId,
        userId: user
      });
      console.log('Invitation accepted:', data);

      // Refresh the organizations list
      setOrgs([]);
      await getUser();
      await getOrgs();

      // Optional: Show success message
      alert('Invitation accepted successfully!');
    } catch (err) {
      console.error('Error accepting invitation:', err);
      alert('Failed to accept invitation. Please try again.');
    } finally {
      setProcessingInvitation(null);
    }
  }

  const handleRejectInvitation = async (invitationId) => {
    if (processingInvitation) return;

    try {
      setProcessingInvitation(invitationId);
      const { data } = await axios.post(`${SERVER_URL}/api/v5/organization/invitations/reject`, {
        orgId: invitationId,
        userId: user
      });
      console.log('Invitation rejected:', data);

      // Remove the rejected invitation from the list
      setOrgs(prevOrgs => prevOrgs.filter(org => org._id || org.organizationId !== invitationId));

      // Optional: Show success message
      alert('Invitation rejected successfully!');
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      alert('Failed to reject invitation. Please try again.');
    } finally {
      setProcessingInvitation(null);
    }
  }

  useEffect(() => {
    // console.log(query.page)
    const fetchData = async () => {
      await getUser(); // Get user data first (sets initial orgs)
      await getOrgs(); // Then get pending invitations (appends without duplicates)
      getActivities();
      getPetition();
      getPost();
      getEvents();
      getAdvert();
      getVictories();
      getUpdates();
      getUsers();
      // set default active once access is available
      if (active === null) {
        const hasDashboard = checkAccess(access, ['View Dashboard']);
        setActive(hasDashboard ? 'summary' : 'content');
      }
    };

    fetchData();
  }, [query.page === undefined])


  const getPetition = async () => {
    try {
      const { data } = await axios.get(
        `/petition?page=1&authorId=${query.page}&limit=100`,
      );
      // console.log(data)
      if (query.page !== undefined) {
        setPetitions(data.data.petitons.petitons)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const getPost = async () => {
    try {
      const { data } = await axios.get(
        `/post?page=1&authorId=${query?.page}&limit=100`,
      );
      // console.log(data)
      if (query.page !== undefined) {
        setPosts(data.data.posts.posts)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const getEvents = async () => {
    try {
      const { data } = await axios.get(
        `/event?page=1&authorId=${query?.page}&limit=100`,
      );
      // console.log(data)
      if (query.page !== undefined) {
        setEvents(data.data.events.events)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const getAdvert = async () => {
    try {
      const { data } = await axios.get(
        `/advert?page=1&authorId=${query?.page}&limit=100`,
      );
      // console.log(data)
      if (query.page !== undefined) {
        setAdverts(data.data.adverts.advert)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const getVictories = async () => {
    try {
      const { data } = await axios.get(
        `/victory?page=1&authorId=${query?.page}&limit=100`,
      );
      // console.log(data)
      if (query.page !== undefined) {
        setVictory(data.data.victory.victories)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const getUpdates = async () => {
    try {
      const { data } = await axios.get(
        `/update?page=1&authorId=${query?.page}&limit=100`,
      );
      // console.log(data)
      if (query.page !== undefined) {
        setUpdates(data.data.updates)
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Fragment>
      <title>PROJECT | Professionals</title>
      <main>
        <HeaderComp />
        <div className="mx-20 pt-6">
          {query.page === undefined ?
            <div>
              <h3>Hello, {userDeeds?.firstName} {userDeeds?.lastName}</h3>
              <p>Here is the list of Organizations/Companies you are working with</p>
              {orgs.length > 0 ? orgs?.map((org, index) => (
                <Link
                  key={index}
                  href={org.status === "Pending" ? "#" : `?page=${org._id}`}
                  onClick={(e) => {
                    if (org.status !== "Pending") {
                      cookie.set('org', org.organizationId || org._id);
                      // Set access if user is an operator in orgInvites
                      const orgInvite = orgInvites.find(o => (o.organizationId || o._id) === (org.organizationId || org._id));
                      if (orgInvite && Array.isArray(orgInvite.operators)) {
                        const operator = orgInvite.operators.find(op => op.userId === user);
                        if (operator && operator.access) {
                          console.log(operator.access);
                          setAccess(operator.access);
                        } else {
                          setAccess(null);
                        }
                      } else {
                        setAccess(null);
                      }
                    } else {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className='flex my-4 rounded-md justify-between p-4 bg-[#F5F6FA]'>
                    <div className='flex'>
                      <img className='w-12 h-12 rounded-full' src={org.image || org.organizationImage} alt="" />
                      <p className='text-xl text-[#000] my-auto ml-6 font-bold'>{org.name || org.organizationName}</p>
                    </div>
                    <div className='w-1/2 flex justify-end gap-4'>
                      {org.status === "Pending" && <div className='flex space-x-4 my-auto'>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAcceptInvitation(org.organizationId);
                          }}
                          disabled={processingInvitation === org.organizationId}
                          className='bg-[#008000] text-white px-4 py-2 rounded hover:bg-[#006600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          {processingInvitation === org.organizationId ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRejectInvitation(org.organizationId);
                          }}
                          disabled={processingInvitation === org.organizationId}
                          className='bg-[#FF0000] text-white px-4 py-2 rounded hover:bg-[#CC0000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                          {processingInvitation === org.organizationId ? 'Processing...' : 'Decline'}
                        </button>
                      </div>}
                      {org.status !== "Pending" && (
                        <p className='text-[#000] my-auto cursor-pointer' onClick={() => setOpen(true)}>Reviews & rating</p>
                      )}
                    </div>
                  </div>
                </Link>
              )) : <div className='text-center my-4 text-xl'>You are not assigned to any organization</div>}

            </div> : <section>
              <div className='w-20'>
                <div onClick={() => { setAccess(null); window.location = '/professional' }} className='flex cursor-pointer'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-left-square-fill" viewBox="0 0 16 16">
                    <path d="M16 14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12zm-4.5-6.5H5.707l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L5.707 8.5H11.5a.5.5 0 0 0 0-1z" />
                  </svg> <p className='ml-2 text-lg'>Back</p>
                </div>
              </div>
              <section className='flex gap-4'>
                <div className="w-[20%] space-y-6 mt-6 text-lg font-medium">
                  {checkAccess(access, 'View Dashboard') && (
                    <div
                      onClick={() => setActive("summary")}
                      className="cursor-pointer"
                    >
                      <span className={active === 'summary' ? 'inline-block border-b border-warning' : ''}>Summary</span>
                    </div>
                  )}

                  <div onClick={() => setActive("content")} className="cursor-pointer">
                    <span className={active === 'content' ? 'inline-block border-b border-warning' : ''}>Manage Content</span>
                  </div>
                  <div onClick={() => setActive("tasks")} className="cursor-pointer">
                    <span className={active === 'tasks' ? 'inline-block border-b border-warning' : ''}>Tasks</span>
                  </div>

                  <div onClick={() => setActive("calendar")} className="cursor-pointer">
                    <span className={active === 'calendar' ? 'inline-block border-b border-warning' : ''}>Calendar</span>
                  </div>
                  <div onClick={() => setActive("social")} className="cursor-pointer">
                    <span className={active === 'social' ? 'inline-block border-b border-warning' : ''}>Social Connect</span>
                  </div>
                  {checkAccess(access, 'View Messages') && (
                    <div onClick={() => setActive("message")} className="cursor-pointer">
                      <span className={active === 'message' ? 'inline-block border-b border-warning' : ''}>Messages</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 w-[80%]">
                  {(() => {
                    switch (active) {
                      case "summary":
                        return <div>
                          <div className="grid grid-cols-4 gap-4">
                            {checkAccess(access, 'View Post Dashboard') && (
                              <div className=" my-4 bg-gold p-6 rounded-md text-white flex justify-between">
                                <div className='cursor-pointer' onClick={() => { setActive('content'), setManage('post') }}>
                                  <p className="text-white">Total Number Of Post</p>
                                  <h1 className="text-2xl text-white font-bold mt-4">{post.length}</h1>
                                </div>
                                <div onClick={() => setOpenPost(true)} className='mt-auto cursor-pointer'>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                                  </svg>
                                </div>
                              </div>
                            )}

                            {checkAccess(access, 'Petitions Dashboard') && (
                              <div className=" my-4 bg-gold p-6 rounded-md text-white flex justify-between">
                                <div className='cursor-pointer' onClick={() => { setActive('content'), setManage('petition') }}>
                                  <p className="text-white">Total Number Of Petitions</p>
                                  <h1 className="text-2xl text-white font-bold mt-4">{petition.length}</h1>
                                </div>
                                <div onClick={() => setOpenPetition(true)} className='mt-auto cursor-pointer'>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                                  </svg>
                                </div>
                              </div>
                            )}

                            {checkAccess(access, 'Event Dashboard') && (
                              <div className=" my-4 bg-gold p-6 rounded-md text-white flex justify-between">
                                <div className='cursor-pointer' onClick={() => { setActive('content'), setManage('event') }}>
                                  <p className="text-white">Total Number Of Events</p>
                                  <h1 className="text-2xl text-white font-bold mt-4">{event.length}</h1>
                                </div>
                                <div className='mt-auto cursor-pointer'>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                                  </svg>
                                </div>
                              </div>
                            )}

                            {checkAccess(access, 'Tasks Dashboard') && (
                              <div className=" my-4 bg-gold p-6 rounded-md text-white flex justify-between">
                                <div className='cursor-pointer' onClick={() => setActive("tasks")} >
                                  <p className="text-white">Total Number of Task</p>
                                  <h1 className="text-2xl text-white font-bold mt-4">{tasks.length}</h1>
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-2xl my-8 text-center text-[#00401C]">Activity Logs</p>

                          <div>
                            {activities.length > 0 ? activities.map((activity, index) => <div className="flex p-3 border-b" key={index}>
                              <img className="w-10 h-10 mr-4 rounded-full" src="./logo.png" alt="" />
                              <p className="my-auto">{activity.text}
                                {/* by {getAuthor(activity.authorId)?.name} */}
                              </p>
                            </div>) : <div className="text-center my-4">No Activities</div>}
                          </div>
                        </div>;
                      case "content":
                        return <div>
                          <div className="flex justify-between my-5">
                            <input type="text" className="p-2 rounded-md border w-[30%]" placeholder="Search" />
                            <div className='flex w-[30%]'>
                              <select onChange={(e) => setManage(e.target.value)} value={manage || ''} className=" p-2 w-52 mr-5 border rounded-md">
                                {checkAccess(access, 'View Petitions') && <option value="petition">Petition</option>}
                                {checkAccess(access, 'View Posts') && <option value="post" >Post</option>}
                                {checkAccess(access, 'View Events') && <option value="event">Events</option>}
                                {/* {checkAccess(access, 'View Adverts') && <option value="advert">Advert</option>}
                              {checkAccess(access, 'View Victories') && <option value="victory">Victory</option>}
                              {checkAccess(access, 'View Updates') && <option value="update">Update</option>} */}

                                <option value="advert">Advert</option>
                                <option value="victory">Victory</option>
                                <option value="update">Update</option>

                              </select>
                              {manage !== "update" && <button onClick={() => UploadTrigger()} className='bg-warning px-6 py-1 rounded-md text-white'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                                </svg>
                              </button>}
                            </div>
                          </div>
                          <div>
                            <Table contents={manage ? contentMap[manage] || [] : []} type={manage} />
                          </div>
                        </div>;
                      case "tasks":
                        return <Tasks />
                      case "message":
                        // return <MessagesComponent />;
                        return <MessagingPicker />;
                      case "calendar":
                        return <AppointmentComp />
                      case "social":
                        return <div className='text-lg text-center my-8'>Comming Soon</div>
                    }
                  })()}
                </div>
              </section>
            </section>
          }
        </div>
        <Reviews open={open} handelClick={() => setOpen(false)} />
        <StartPetition open={openPetition} handelClick={() => setOpenPetition(!openPetition)} data={null} author={userDeeds} />
        <CreatePost open={openPost} handelClick={() => setOpenPost(!openPost)} post={null} />
        <CreateAdvert open={openAdvert} handelClick={() => setOpenAdvert(!openAdvert)} advert={null} />
        <CreateEvent open={openEvent} handelClick={() => setOpenEvent(!openEvent)} event={null} />
        <CreateVictories open={openVictory} handelClick={() => setOpenVictory(!openVictory)} victory={null} />
      </main>
    </Fragment>

  );
};

export default Professionals;
