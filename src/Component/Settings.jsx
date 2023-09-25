import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile"

const Settings = () => {
  const navigate = useNavigate();
  // variable for userToken to check authorization
  const userToken = sessionStorage.getItem("token");

  // useEffect hook, this will run everything inside the callback
  // function once when the component loads
  // the dependency array has userToken inside of it, which means the useEffect will
  // run everything inside of it everytime the userToken variable changes
  useEffect(() => {
    console.log(userToken);
    if (!userToken) {
      navigate("/");
    }
  }, [userToken]);

  return (
    <div className="settings">
      <p>Settings</p>
      <Profile userid={sessionStorage.getItem("user")} />
    </div>
  );
};

export default Settings;
