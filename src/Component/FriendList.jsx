import React, { useEffect } from "react";
import blockIcon from "../assets/block_white_216x216.png";
import unblockIcon from "../assets/thumbsup.png";
import messageIcon from "../assets/comment.svg";
import { useNavigate } from "react-router-dom";
import { socket } from "../App";

const FriendList = (props) => {
  const navigate = useNavigate();

  useEffect(() => {
    props.loadFriends();
  }, []); // Empty dependency array ensures this effect runs once after the initial render

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
          props.setConnections([]);
          props.loadFriends();
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

  useEffect(() => {
    // function for creating a room
    const handleCreateRoom = (data) => {
      if (data && data.roomID) {
        console.log("Room created:", data.roomID);
        navigate(`/messages/${data.roomID}`);
        sessionStorage.setItem("toUserID", props.userId);
      }
    };

    //Listen for a response after room creation
    // socket.on is used to listen for incoming events from the server.
    // it's used to set up a listener for room creation
    // if it is the first time, it will create a room between the two users, otherwise it will join a room
    // that has already been established
    socket.on("/room-created", handleCreateRoom);

    // cleanup
    return () => {
      // when the user leaves the component/page, this socket.off will be called which will turn off the listener
      // for room creation
      socket.off("/room-created", handleCreateRoom);
    };
  }, [navigate, props.userId]);

  const handleMessageClick = (connectionUser) => {
    console.log(connectionUser);
    // Emit an event to create a room with the provided user IDs
    // socket.emit is used to send events from the client to the server.
    // it's used to create a room if it doesn't exist or join a room if one is already established
    socket.emit("/chat/join-room", {
      fromUserID: sessionStorage.getItem("user"),
      toUserID: connectionUser.id,
    });

    console.log("Called join room");

    // Do stuff to join the room once it's actually created
    socket.once("/room-created", (data) => {
      console.log("Room Created");
      if (data && data.roomID) {
        sessionStorage.setItem("toUserID", connectionUser.id);
        sessionStorage.setItem("roomID", data.roomID);
        navigate(`/messages/${data.roomID}`);
      }
    });
  };

  if (props.error) {
    return <div> Error: {props.error.message} </div>;
  } else if (!props.isLoaded) {
    return <div> Loading... </div>;
  } else {
    return (
      <div className="post">
        <ul>
          {/* the list comes back in oldest first order, reverse so newest shows at the top */}
          {props.connections.reverse().map((connection) => (
            <div key={connection.id} className="userlist">
              <div>
                {connection.toUser.attributes.username} -{" "} {connection.attributes.status}
              </div>
              <div className="friends-icons-container deletePost">
                <div className="deletePost">
                  {/* Set the id param dynamically to the user's id you want to specifically want to get */}
                  <img
                    src={messageIcon}
                    className="sidenav-icon deleteIcon"
                    alt="Message User"
                    title="Message User"
                    onClick={() => handleMessageClick(connection.toUser)}
                  />
                </div>
                <div>
                  {conditionalAction(
                    connection.attributes.status,
                    connection.id
                  )}
                </div>
              </div>
            </div>
          ))}
        </ul>
      </div>
    );
  }
};

export default FriendList;
