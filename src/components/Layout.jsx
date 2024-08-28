import React, { Fragment, useEffect } from "react";
import HeaderComp from "../components/HeaderComp";
import { getCookie } from "cookies-next";

const FrontLayout = ({ children }) => {
  const text = `PROJECT`;

  useEffect(() => {
    // console.log(token);
    const token = getCookie("token") ?? localStorage.getItem("token");
    if (token === undefined) {
      window.location.href = "/";
    }
  }, []);
  return (
    <Fragment>
      <title>{text}</title>
      <div className="front">
        <HeaderComp />
        <div className="children">{children}</div>
      </div>
    </Fragment>
  );
};

export default FrontLayout;
