import Link from "next/link";
import React from "react";

const HeaderComp = () => {
  return (
    <header className="bg-[#F5F6FA] px-8 py-4 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/">
            <img
              src="/images/logo1.jpg"
              alt="Logo"
              className="w-10 h-10 rounded-full cursor-pointer"
            />
          </Link>
          <h1 className="font-bold text-xl ml-4 text-warning tracking-wide">
            ExpertHub
          </h1>
        </div>
        <nav className="flex space-x-6">
          <Link href="https://experthubllc.com/">
            <span className="text-black hover:text-warning font-medium cursor-pointer">
              Home
            </span>
          </Link>
          <Link href="https://experthubllc.com/feeds?findExpert=1">
            <span className="text-gray-700 hover:text-warning font-medium cursor-pointer">
              Find Experts
            </span>
          </Link>
          <Link href="https://experthubllc.com/events">
            <span className="text-gray-700 hover:text-warning font-medium cursor-pointer">
              Events
            </span>
          </Link>
          <Link href="https://experthubllc.com/connection">
            <span className="text-gray-700 hover:text-warning font-medium cursor-pointer">
              My Connection
            </span>
          </Link>
          <Link href="https://experthubllc.com/messages">
            <span className="text-gray-700 hover:text-warning font-medium cursor-pointer">
              Messages
            </span>
          </Link>
        </nav>
        <Link href="https://experthubllc.com/professional/auth">
          <button className="bg-warning px-6 py-2 text-white rounded-md font-semibold shadow hover:bg-yellow-600 transition">
            Login
          </button>
        </Link>
      </div>
    </header>
  );
};

export default HeaderComp;
