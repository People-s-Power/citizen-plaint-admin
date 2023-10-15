import Link from "next/link";
import React from "react";

const Summary = ({ summary }) => {
  return (
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
  );
};

export default Summary;
