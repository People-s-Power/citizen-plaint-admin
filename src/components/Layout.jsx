import React, { Fragment, ReactChild } from "react";
import HeaderComp from "../components/HeaderComp";

const FrontLayout = ({ children }) => {
  const text = `CITIZEN PLAINT`;
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
