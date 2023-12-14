import React, { useState, useEffect } from "react";
import FriendForm from "./FriendForm";
import FriendList from "./FriendList";
import { useNavigate } from "react-router-dom";

const Friends = () => {
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
    <div>
      <p>Friends</p>
      <FriendForm userid={sessionStorage.getItem("user")} />
      <FriendList userid={sessionStorage.getItem("user")} />
    </div>
  );
};

export default Friends;
