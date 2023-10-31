import React, { useState, useEffect } from "react";
import blockIcon from "../assets/block_white_216x216.png";
import unblockIcon from "../assets/thumbsup.png";

const FriendList = (props) => {
  const [connections, setConnections] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFriends();
  }, []); // Empty dependency array ensures this effect runs once after the initial render

  const loadFriends = () => {
    fetch(
      process.env.REACT_APP_API_PATH +
        "/connections?userID=" +
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
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  };

  const updateConnection = (id, status) => {
    //make the api call to the user controller with a PATCH request for updating a connection with another user
    fetch(process.env.REACT_APP_API_PATH + "/connections/" + id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      body: JSON.stringify({
        attributes: { status: status, type: "friend" },
      }),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          setConnections([]);
          loadFriends();
        },
        (error) => {
          alert("error!");
        }
      );
  };

  // If the user is not blocked, show the block icon
  // Otherwise, show the unblock icon and update the connection
  // with the updateConnection function
  const conditionalAction = (status, id) => {
    if (status === "active") {
      return (
        <img
          src={blockIcon}
          className="sidenav-icon deleteIcon"
          alt="Block User"
          title="Block User"
          onClick={() => updateConnection(id, "blocked")}
        />
      );
    } else {
      return (
        <img
          src={unblockIcon}
          className="sidenav-icon deleteIcon"
          alt="Unblock User"
          title="Unblock User"
          onClick={() => updateConnection(id, "active")}
        />
      );
    }
  };

  if (error) {
    return <div> Error: {error.message} </div>;
  } else if (!isLoaded) {
    return <div> Loading... </div>;
  } else {
    return (
      <div className="post">
        <ul>
          {connections.map((connection) => (
            <div key={connection.id} className="userlist">
              {connection.toUser.attributes.username} -{" "}
              {connection.attributes.status}
              <div className="deletePost">
                {conditionalAction(connection.attributes.status, connection.id)}
              </div>
            </div>
          ))}
        </ul>
      </div>
    );
  }
};

export default FriendList;
