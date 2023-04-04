import React, { Fragment, useState } from "react";
import axios from "axios";
import { setCookie } from "cookies-next";

const auth = () => {
  const [email, setEmail] = useState("kingifean@gmail.com");
  const [password, setPassword] = useState("RWEs323$%ddfdf");
  const submit = async () => {
    if (email === "" || password === "") {
      return;
    }
    try {
      const { data } = await axios.post(
        "https://shark-app-28vbj.ondigitalocean.app/v1/admin/login",
        {
          email: email,
          password: password,
        }
      );
      console.log(data);
      setCookie("token", data.meta.token);
      window.location.href = "/";
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Fragment>
      <title>CITIZEN PLAINT | Login</title>
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
          Login
        </button>
      </div>
    </Fragment>
  );
};

export default auth;
