import React, { Fragment, useEffect, useState } from 'react';
import { getCookie } from "cookies-next";
import axios from "axios";
import HeaderComp from '@/components/HeaderComp';
import Link from 'next/link';
import router, { useRouter } from "next/router"
import StartPetition from '@/components/modals/StartPetition';
import CreatePost from '@/components/modals/CreatePost';
import CreateAdvert from '@/components/modals/CreateAdvert';
import CreateEvent from '@/components/modals/CreateEvent';
import CreateVictories from '@/components/modals/CreateVictories';

const Professionals = () => {
  const [userDeeds, setUser] = useState()
  const [orgs, setOrgs] = useState([])
  const user = getCookie("user");
  const { query } = useRouter()
  const [active, setActive] = useState("summary");
  const [manage, setManage] = useState("petition")

  const [posts, setPosts] = useState([])
  const [events, setEvents] = useState([])
  const [adverts, setAdverts] = useState([])
  const [petitions, setPetitions] = useState([])
  const [updates, setUpdates] = useState([])
  const [victory, setVictory] = useState([])


  const [openPetition, setOpenPetition] = useState(false)
  const [openPost, setOpenPost] = useState(false)
  const [openAdvert, setOpenAdvert] = useState(false)
  const [openEvent, setOpenEvent] = useState(false)
  const [openVictory, setOpenVictory] = useState(false)

  const UploadTrigger = () => {
    if (manage === "petition") {
      setOpenPetition(true)
    } else if (manage === "advert") {
      setOpenAdvert(true)
    } else if (manage === "post") {
      setOpenPost(true)
    } else if (manage === "event") {
      setOpenEvent(true)
    } else if (manage === "victory") {
      setOpenVictory(true)
    }
  }

  const getUser = async () => {
    try {
      const { data } = await axios.get(
        `/user/single/${user}`,
      );
      setUser(data.data.user)
      // data.data.user.orgOperating.map(org => getOrg(org))
    } catch (e) {
      console.log(e);
    }
  }
  useEffect(() => {
    getUser()
    // userDeeds?.
    // console.log(orgs)
  }, [])

  const getOrg = async (org) => {
    try {
      const { data } = await axios.get(
        `/org/${org}`
      );
      console.log(data);
      setOrgs([...orgs, data.data.organization])
    } catch (e) {
      console.log(e)
    }
  }
  return (
    <Fragment>
      <title>CITIZEN PLAINT | Professionals</title>
      <main>
        <HeaderComp />
        <div className="mx-40 pt-6">
          {query.page === undefined ? <div>
            <h3>Hello, {userDeeds?.firstName}</h3>
            {orgs?.map((org, index) => <Link key={index} href={`?page=${org._id}`}>
              <div className='flex my-4 rounded-md p-4 bg-[#F5F6FA]'>
                <img className='w-12 h-12 rounded-full' src={org.image} alt="" />
                <p className='text-xl text-[#000] my-auto ml-6 font-bold'>{org.name}</p>
              </div>
            </Link>)}
          </div> : <section>
            <div className='w-20'>
              <Link href={'/professional'} className='flex'>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left-square-fill" viewBox="0 0 16 16">
                  <path d="M16 14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12zm-4.5-6.5H5.707l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L5.707 8.5H11.5a.5.5 0 0 0 0-1z" />
                </svg> <p className='ml-2'>Back</p>
              </Link>
            </div>
            <div className="flex w-[40%] mx-auto justify-between">
              <div
                onClick={() => setActive("summary")}
                className={
                  active === "summary"
                    ? "border-b border-warning cursor-pointer"
                    : "cursor-pointer"
                }
              >
                Summary
              </div>
              <div
                onClick={() => setActive("content")}
                className={
                  active === "content"
                    ? "border-b border-warning cursor-pointer"
                    : "cursor-pointer"
                }
              >
                Manage Content
              </div>
            </div>

            <div className="pt-4">
              {(() => {
                switch (active) {
                  case "summary":
                    return <div>
                      <div className="flex justify-between flex-wrap">
                        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white flex justify-between">
                          <div className='cursor-pointer' onClick={() => { setActive('content'), setManage('post') }}>
                            <p className="text-white">Total Number Of Post</p>
                            <h1 className="text-2xl text-white font-bold mt-4">{posts.length}</h1>
                          </div>
                          <div onClick={() => setOpenPost(true)} className='mt-auto cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                            </svg>
                          </div>
                        </div>
                        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white flex justify-between">
                          <div className='cursor-pointer' onClick={() => { setActive('content'), setManage('petition') }}>
                            <p className="text-white">Total Number Of Petitions</p>
                            <h1 className="text-2xl text-white font-bold mt-4">{petitions.length}</h1>
                          </div>
                          <div onClick={() => setOpenPetition(true)} className='mt-auto cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                            </svg>
                          </div>
                        </div>
                        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white flex justify-between">
                          <div className='cursor-pointer' onClick={() => { setActive('content'), setManage('advert') }}>
                            <p className="text-white">Total Number Of Adverts</p>
                            <h1 className="text-2xl text-white font-bold mt-4">{adverts.length}</h1>
                          </div>
                          <div onClick={() => setOpenAdvert(true)} className='mt-auto cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                            </svg>
                          </div>
                        </div>
                        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white flex justify-between">
                          <div className='cursor-pointer' onClick={() => { setActive('content'), setManage('event') }}>
                            <p className="text-white">Total Number Of Events</p>
                            <h1 className="text-2xl text-white font-bold mt-4">{events.length}</h1>
                          </div>
                          <div onClick={() => setOpenEvent(true)} className='mt-auto cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                            </svg>
                          </div>
                        </div>
                        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white flex justify-between">
                          <div className='cursor-pointer' onClick={() => { setActive('content'), setManage('victory') }}>
                            <p className="text-white">Total Number Of Victories</p>
                            <h1 className="text-2xl text-white font-bold mt-4">{victory.length}</h1>
                          </div>
                          <div onClick={() => setOpenVictory(true)} className='mt-auto cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                            </svg>
                          </div>
                        </div>
                        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white flex justify-between">
                          <div className='cursor-pointer' onClick={() => { setActive('content'), setManage('update') }}>
                            <p className="text-white">Total Number Of Updates</p>
                            <h1 className="text-2xl text-white font-bold mt-4">{updates.length}</h1>
                          </div>
                          <div className='mt-auto cursor-pointer'>
                            {/* <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle-fill" viewBox="0 0 16 16">
                              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                            </svg> */}
                          </div>
                        </div>
                      </div>
                    </div>;
                  case "content":
                    return <div>
                      <div className="flex justify-between my-5">
                        <input type="text" className="p-2 rounded-md border w-[30%]" placeholder="Search" />
                        <div className='flex w-[30%]'>
                          <select onChange={(e) => setManage(e.target.value)} value={manage} className=" p-2 w-52 mr-5 border rounded-md">
                            <option value="petition">Petition</option>
                            <option value="post" >Post</option>
                            <option value="event">Events</option>
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
                      <div>Content</div>
                    </div>;
                }
              })()}
            </div>
          </section>
          }
        </div>
        <StartPetition open={openPetition} handelClick={() => setOpenPetition(!openPetition)} data={null} />
        <CreatePost open={openPost} handelClick={() => setOpenPost(!openPost)} post={null} />
        <CreateAdvert open={openAdvert} handelClick={() => setOpenAdvert(!openAdvert)} advert={null} />
        <CreateEvent open={openEvent} handelClick={() => setOpenEvent(!openEvent)} event={null} />
        <CreateVictories open={openVictory} handelClick={() => setOpenVictory(!openVictory)} victory={null} />
      </main>
    </Fragment>

  );
};

export default Professionals;