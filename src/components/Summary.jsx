import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";

const Summary = ({ summary, users }) => {

  const getAuthor = (id) => {
    var name
    users.map((user) => {
      if (user._id === id) {
        name = user.name
      }
    })
    return name
  }

  const [activities, setActivities] = useState([])
  const getActivities = async () => {
    try {
      const { data } = await axios.patch("auth/activities?page=1&limit=10")
      setActivities(data.data.activities.activities)
      console.log(data.data.activities.activities)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getActivities()
  }, [])

  return (
    <>
      <div className="flex justify-between flex-wrap">
        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
          <Link href={'/admin?page=user'}>
            <p className="text-white">Total Number Of Users</p>
            <h1 className="text-2xl text-white font-bold mt-4">{summary.users}</h1>
          </Link>
        </div>
        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
          <Link href={'/admin?page=user'}>
            <p className="text-white">Total Number Of Organisations</p>
            <h1 className="text-2xl text-white font-bold mt-4">{summary.orgs}</h1>
          </Link>
        </div>
        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
          <Link href={'/admin?page=content'}>
            <p className="text-white">Total Number Of Post</p>
            <h1 className="text-2xl text-white font-bold mt-4">{summary.posts}</h1>
          </Link>
        </div>
        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
          <Link href={'/admin?page=content'}>
            <p className="text-white">Total Number Of Petitions</p>
            <h1 className="text-2xl text-white font-bold mt-4">{summary.petitions}</h1>
          </Link>
        </div>
        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
          <Link href={'/admin?page=content'}>
            <p className="text-white">Total Number Of Adverts</p>
            <h1 className="text-2xl text-white font-bold mt-4">{summary.adverts}</h1>
          </Link>
        </div>
        <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
          <Link href={'/admin?page=content'}>
            <p className="text-white">Total Number Of Events</p>
            <h1 className="text-2xl text-white font-bold mt-4">{summary.events}</h1>
          </Link>
        </div>
      </div>
      <p className="text-2xl my-8 text-center text-[#00401C]">Activity Logs</p>

      <div>
        {activities.length > 0 ? activities.map((activity, index) => <div className="flex p-3 border-b" key={index}>
          <img className="w-10 h-10 mr-4 rounded-full" src={getAuthor(activity.authorId)?.image} alt="" />
          <p className="my-auto">{activity.text} by {getAuthor(activity.authorId)?.name}</p>
        </div>) : <div className="text-center my-4">No Activities</div>}
      </div>
    </>
  );
};

export default Summary;
