import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import { navItems } from "./NavBar";

const RequireAuth = ({ children }) => {
  let location = useLocation();
  const userstr = window.sessionStorage.getItem("user");
  const route = navItems.find(navItem => navItem.path === location.pathname);

  if (!window.sessionStorage.getItem("token") || !userstr) {
    return <Navigate to={"/Login"} state={{ from: location }} replace />;
  }

  if (!route) {
    return <Navigate to={"/Login"} state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
