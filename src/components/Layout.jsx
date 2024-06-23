import React, { Fragment, useEffect } from "react";
import HeaderComp from "../components/HeaderComp";
import { getCookie } from "cookies-next";

const FrontLayout = ({ children }) => {
  const token = getCookie("token");
  const text = `PROJECT`;

  useEffect(() => {
    // console.log(token);
    if (token === undefined) {
      window.location.href = "/auth";
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
