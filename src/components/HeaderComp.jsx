
import Link from "next/link";
import React from "react";
import { useAtom } from 'jotai';
import { adminAtom } from '@/atoms/adminAtom';
import { deleteCookie } from 'cookies-next';

const HeaderComp = () => {
  const [admin] = useAtom(adminAtom);

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
        {admin ? (
          <div className="relative flex items-center space-x-3 group">
            <img src={admin.image || "/images/assistant.png"} alt="User" className="w-10 h-10 rounded-full border-2 border-warning shadow" />
            <div className="flex flex-col items-start">
              <span className="font-semibold text-warning text-base">{admin.firstName || admin.email}</span>
              {admin.email && <span className="text-xs text-gray-500">{admin.email}</span>}
            </div>
            <div className="relative">
              <button
                className="ml-2 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700 hover:bg-warning hover:text-white transition focus:outline-none"
                onClick={() => {
                  document.getElementById('logout-dropdown').classList.toggle('hidden');
                }}
              >
                ▾
              </button>
              <div id="logout-dropdown" className="hidden absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-warning hover:text-white rounded"
                  onClick={() => {
                    window.localStorage.removeItem('adminUser');
                    deleteCookie('token');
                    deleteCookie('user');
                    window.location.href = '/';
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link href="https://experthubllc.com/professional/auth">
            <button className="bg-warning px-6 py-2 text-white rounded-md font-semibold shadow hover:bg-yellow-600 transition">
              Login
            </button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default HeaderComp;
