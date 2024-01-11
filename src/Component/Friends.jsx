import React, { useState, useEffect } from "react";
import FriendForm from "./FriendForm";
import FriendList from "./FriendList";
import { useNavigate } from "react-router-dom";

const Friends = () => {
  const [connections, setConnections] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // variable for userToken to check authorization
  const userToken = sessionStorage.getItem("token");

  // useEffect hook, this will run everything inside the callback
  // function once when the component loads
  // the dependency array has userToken inside of it, which means the useEffect will
  // run everything inside of it everytime the userToken variable changes
  useEffect(() => {
    console.log(userToken);

    // if the user is not logged in, go back to the default route, which will take them to the login page
    if (!userToken) {
      navigate("/");
    }
  }, [userToken, navigate]);

  const loadFriends = () => {
    fetch(
      process.env.REACT_APP_API_PATH +
        "/connections?fromUserID=" +
        sessionStorage.getItem("user"),
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      }
    )
      .then((res) => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setConnections(result[0]);
          console.log(result[0]);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  };

  return (
    <div>
      <p>Friends</p>
      <FriendForm
        userid={sessionStorage.getItem("user")}
        loadFriends={loadFriends}
      />
      <FriendList
        userid={sessionStorage.getItem("user")}
        loadFriends={loadFriends}
        connections={connections}
        setConnections={setConnections}
        isLoaded={isLoaded}
        error={error}
      />
    </div>
  );
};

export default Friends;
