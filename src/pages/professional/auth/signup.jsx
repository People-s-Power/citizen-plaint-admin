import React, { Fragment, useState } from "react";
import Link from "next/link";
import { setCookie } from "cookies-next";
import axios from "axios";

const ProfAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")

  const submit = async () => {
    if (email === "" || password === "" || name === "") {
      return;
    }
    try {
      setLoading(true)
      const { data } = await axios.post(
        "/auth",
        {
          name: name,
          email: email,
          password: password,
          accountType: "Staff"
        }
      );
      console.log(data);
      setCookie("token", data.meta.token);
      window.location.href = "/professional/auth";
    } catch (e) {
      console.log(e);
      setLoading(false)
    }
  };

  return (
    <Fragment>
      <title>CITIZEN PLAINT | Professional</title>

      <div className="mx-auto lg:w-1/2 text-center lg:my-40">
        <h1 className="my-4 font-bold text-xl">Sign Up as a Professional</h1>
        <input
          type="text"
          className="p-3 w-full my-3 bg-[#E5E5E5]"
          placeholder="Enter your Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
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
          {loading ? 'loading...' : 'Sign Up'}
        </button>
        <Link href={'/professional/auth'}>
          <p className="text-left text-warning">Login Instead?</p>
        </Link>
      </div>
    </Fragment>
  );
};

export default ProfAuth;