import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../App";

// This Messaging component shows a way in which you can set up messaging between
// two users with the use of websockets.
const Messaging = () => {
  const [userData, setUserData] = useState({});
  const [otherUserData, setOtherUserData] = useState({});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();
  const userToken = sessionStorage.getItem("token");
  const roomID = sessionStorage.getItem("roomID");
  // The useParams hook from react-router-dom returns an object.
  // The object keys are the parameter names declared in the path string
  // in the Route definition, and the values are the corresponding
  // URL segment from the matching URL.
  // We can destructor the object to give us the userID in a variable
  // that we can use throughout the component
  const { userID } = useParams();

  // When the page loads, fetch the user's data that is logged in
  // as well as the user's data that you're messaging with to display
  // their information/attributes on the page if needed
  useEffect(() => {
    // fetch the user you're logged in as
    fetch(
      process.env.REACT_APP_API_PATH +
        `/users/${sessionStorage.getItem("user")}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUserData(data);
      })
      .catch((err) => {
        console.log(err);
      });

    // fetch the other user
    fetch(process.env.REACT_APP_API_PATH + `/users/${userID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setOtherUserData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    // Function to handle the event when a message is received
    const handleMessageReceived = (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    // WebSocket listener for receiving messages
    socket.on("/send-message", handleMessageReceived);

    // Fetch the chat history when the component mounts
    fetchChatHistory();

    return () => {
      // Clean up the listener when the component unmounts
      socket.off("/send-message", handleMessageReceived);
    };
  }, [roomID]);

  // Function to fetch chat history from the server with the given roomID which is saved locally from FriendList.jsx
  const fetchChatHistory = async () => {
    if (!roomID) return;

    fetch(process.env.REACT_APP_API_PATH + `/chat-history/history/${roomID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setMessages(result);
        console.log(result)
      });
  };

  // if the user isn't logged in, send them to homepage to log in
  useEffect(() => {
    console.log(userToken);
    if (!userToken) {
      navigate("/");
    }
  }, [userToken]);

  return (
    <div className="chat">
      <div className="chat__main">
        <div>
          <p>{otherUserData.email}</p>
        </div>

        {/*This shows messages sent from you*/}
        <div className="message__container">
          <div className="message__chats">
            <p className="sender__name">{userData.email}</p>
            <div className="message__sender">
              <p>Hello there</p>
            </div>
          </div>

          {/*This shows messages received by you*/}
          <div className="message__chats">
            <p className="recipient__name">{otherUserData.email}</p>
            <div className="message__recipient">
              <p>Hey, I'm good, you?</p>
            </div>
          </div>
        </div>

        <div className="chat__footer">
          <form className="form">
            <input
              type="text"
              placeholder="Write message"
              className="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="sendBtn">SEND</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
