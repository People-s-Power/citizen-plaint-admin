import React from "react";

const Summary = ({ summary }) => {
  return (
    <div className="flex justify-between flex-wrap">
      <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
        <p>Total Number Of Users</p>
        <h1 className="text-2xl font-bold mt-4">{summary.users}</h1>
      </div>
      <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
        <p>Total Number Of Organisations</p>
        <h1 className="text-2xl font-bold mt-4">{summary.orgs}</h1>
      </div>
      <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
        <p>Total Number Of Post</p>
        <h1 className="text-2xl font-bold mt-4">{summary.posts}</h1>
      </div>
      <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
        <p>Total Number Of Petitions</p>
        <h1 className="text-2xl font-bold mt-4">{summary.petitions}</h1>
      </div>
      <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
        <p>Total Number Of Adverts</p>
        <h1 className="text-2xl font-bold mt-4">{summary.adverts}</h1>
      </div>
      <div className="w-[32%] my-4 bg-gold p-6 rounded-md text-white">
        <p>Total Number Of Events</p>
        <h1 className="text-2xl font-bold mt-4">{summary.events}</h1>
      </div>
    </div>
  );
};

export default Summary;
