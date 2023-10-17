import Link from "next/link";
import React from "react";

const HeaderComp = () => {
  return (
    <div className="bg-[#F5F6FA] px-40 p-5">
      <div className="flex justify-between">
        <div className="flex">
          <img src="/logo.png" alt="" />
          <h1 className="font-bold text-lg my-auto ml-6">CITIZEN PLAINT</h1>
        </div>
        <Link href={'/'}>
          <button className="bg-warning px-8 py-2 text-white rounded-md">Logout</button>
        </Link>
      </div>
    </div>
  );
};

export default HeaderComp;
