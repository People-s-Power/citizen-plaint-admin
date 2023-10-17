import React, { Fragment, useState } from "react";
import Link from "next/link";
import { setCookie } from "cookies-next";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const ProfAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (email === "" || password === "") {
      return;
    }
    try {
      setLoading(true)
      const { data } = await axios.post(
        "/auth/login",
        {
          email: email,
          password: password,
        }
      );
      console.log(data);
      setCookie("token", data.meta.token);
      setCookie("user", data.data.user.id);
      window.location.href = "/professional";

    } catch (e) {
      console.log(e);
      setLoading(false)
      toast.warn(e?.response.data.message)
    }
  };

  return (
    <Fragment>
      <title>CITIZEN PLAINT | Professional</title>

      <div className="mx-auto lg:w-1/2 text-center lg:my-40">
        <h1 className="my-4 font-bold text-xl">Login as a Professional</h1>
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
        <Link href={'/professional/auth/signup'}>
          <p className="text-left text-warning">Sign Up Instead</p>
        </Link>
      </div>
      <ToastContainer />
    </Fragment>
  );
};

export default ProfAuth;