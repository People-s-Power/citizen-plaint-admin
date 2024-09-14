import React, { Fragment, useState } from "react";
import Link from "next/link";
import { setCookie } from "cookies-next";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactSelect from "react-select";

const PROFESSIONS = [
  "General Administrative Assistant",
  "Social Media Manager ",
  "Real Estate",
  "Virtual Research",
  "Virtual Data Entry",
  "Virtual Book keeper",
  "Virtual ecommerce",
  "Customer Service Provider (Phone/Chat",
  "Content Writer",
  "Website Management",
  "Public Relation Assistant",
  "Graphic designs",
  "Appointment/Calendar setter",
  "Email Management",
  "Campaign/petition Writer",
];

const ProfAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");

  const submit = async () => {
    if (email === "" || password === "" || name === "") {
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.post("/auth", {
        name: name,
        email: email,
        password: password,
        profession: profession,
      });
      console.log(data);
      // setCookie("token", data.meta.token);
      window.location.href = "/professional/auth";
    } catch (e) {
      console.log(e);
      e.response && toast.warn(e?.response.data.message);
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <title>CITIZEN PLAINT | Professional</title>

      <div className="mx-auto text-center lg:my-40">
        <h1 className="my-4 font-bold text-2xl">Sign Up as a Professional</h1>
        <div className="flex justify-evenly">
          <div className="my-auto w-[40%]">
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

            <select
              onChange={(e) => setProfession(e.target.value)}
              className="p-3 w-full my-3 bg-[#E5E5E5]"
            >
              <option className="hidden" value="">
                Select a role
              </option>

              {PROFESSIONS.map((prof) => (
                <option value={prof}>{prof}</option>
              ))}
            </select>

            <button
              onClick={() => submit()}
              className="bg-warning p-3 w-full my-3 text-white text-lg"
            >
              {loading ? "loading..." : "Sign Up"}
            </button>
            <Link href={"/professional/auth"}>
              <p className="text-left text-warning">Login Instead?</p>
            </Link>
          </div>
          <img src="/images/assistant.png" alt="" />
        </div>
      </div>
      <ToastContainer />
    </Fragment>
  );
};

export default ProfAuth;
