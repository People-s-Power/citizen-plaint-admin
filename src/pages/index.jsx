import React, { Fragment, useState } from "react";
import { useSetAtom } from 'jotai';
import { adminAtom } from '@/atoms/adminAtom';
import axios from "axios";
import { setCookie } from "cookies-next";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAdmin = useSetAtom(adminAtom);
  const submit = async () => {
    if (email === "" || password === "") {
      return;
    }
    try {
      setLoading(true)
      const { data } = await axios.post(
        "/admin/login",
        {
          email: email,
          password: password,
        }
      );
      console.log(data);
      setCookie("token", data.meta.token);
      localStorage.setItem("token", data.meta.token);
      // Set Jotai global state
      setAdmin(data.data.admin);
      window.location.href = "/admin";


    } catch (e) {
      console.log(e);
      setLoading(false)
      toast.warn(e?.response.data.message)
    }
  };
  return (
    <Fragment>
      <title>PROJECT | Login</title>
      <div className="mx-auto lg:w-1/2 text-center lg:my-40">
        <h1 className="my-4 font-bold text-xl">Login</h1>
        <input
          type="text"
          className="p-3 w-full my-3 bg-[#E5E5E5]"
          placeholder="Enter your Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <input
          type="password"
          className="p-3 w-full my-3 bg-[#E5E5E5]"
          placeholder="Enter your Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <button
          onClick={() => submit()}
          className="bg-warning p-3 w-full my-3 text-white text-lg"
        >
          {loading ? 'loading...' : 'Login'}
        </button>
        <Link href={'/professional/auth'}>
          <p className="text-left text-warning">Become a Professional</p>
        </Link>
      </div>
      <ToastContainer />
    </Fragment>
  );
};

export default auth;
