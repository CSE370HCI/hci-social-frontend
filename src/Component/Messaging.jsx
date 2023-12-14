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
  // The useParams hook from react-router-dom returns an object.
  // The object keys are the parameter names declared in the path string
  // in the Route definition, and the values are the corresponding
  // URL segment from the matching URL.
  // We can destructor the object to give us the roomID in a variable
  // that we can use throughout the component
  const { roomID } = useParams();

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
        setUserData(data);
      })
      .catch((err) => {
        console.log(err);
      });

    // fetch the other user
    // toUserID holds the id of the other user you want to message with
    fetch(process.env.REACT_APP_API_PATH + `/users/${sessionStorage.getItem("toUserID")}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOtherUserData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    // Function to handle the event when a message is received
    const handleMessageReceived = (msg) => {
      console.log('message received', msg)
      // handles incoming messages, sets the messages state to what the previous state was by using the spread operator (...prevMessages)
      // and then adding a new element where its the entire message object itself (...msg) and then giving it an id
      setMessages((prevMessages) => [...prevMessages, {
        ...msg,
        id: msg.id || Date.now()
      }]);
    };

    // WebSocket listener for receiving messages
    // socket.on is used to listen for incoming events from the server. 
    // it's used to set up a listener for messages that are sent by other users in the chat room.
    socket.on("/send-message", handleMessageReceived);

    // Fetch the chat history when the component mounts
    const fetchChatHistory = () => {
      if (!roomID) return;

      fetch(
        process.env.REACT_APP_API_PATH + `/chat-history/history/${roomID}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      )
        .then((res) => res.json())
        .then((result) => {
          setMessages(
            result.map((msg) => ({
              id: msg.id,
              fromUserID: msg.fromUserId,
              message: msg.content,
            }))
          );
        });
    };

    fetchChatHistory();

    return () => {
      // Clean up the listener when the component unmounts
      // When the user leaves the page/component, socket.off will be called
      socket.off("/send-message", handleMessageReceived);
    };
  }, [roomID]);

  // Function to fetch chat history from the server with the given roomID which is saved locally from FriendList.jsx

  // if the user isn't logged in, send them to homepage to log in
  useEffect(() => {
    if (!userToken) {
      navigate("/");
    }
  }, [userToken]);

  const handleMessageSend = (e) => {
    e.preventDefault();

    const payload = {
      fromUserID: parseInt(userData.id),
      toUserID: otherUserData.id,
      message: message,
    };

    console.log(payload);
    // socket.emit is used to send events from the client to the server.
    // it's used to send a message to the server when a user wants to send a chat message.
    socket.emit("/chat/send", payload);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        ...payload,
        id: Date.now(),
      },
    ]);
    console.log(messages);

    setMessage("");
  };

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <div className="chat">
      <div className="chat__main">
        <div>
          <p>{otherUserData.email}</p>
        </div>

        {/*This shows messages sent from you*/}
        <div className="message__container">
          {messages.length > 0 &&
            messages.map((msg) => (
              <div className="message__chats" key={msg.id}>
                {msg.fromUserID === userData.id ? (
                  <>
                    {/* Display messages from yourself */}
                    <p className="sender__name">{userData.email}</p>
                    <p className="message__sender">{msg.message}</p>
                  </>
                ) : (
                  <> 
                    {/* Display messages from the other user */}
                    <p className="recipient__name">{otherUserData.email}</p>
                    <p className="message__recipient">{msg.message}</p>
                  </>
                )}
              </div>
            ))}
        </div>

        <div className="chat__footer">
          <form className="form" onSubmit={handleMessageSend}>
            <input
              type="text"
              placeholder="Write message"
              className="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="sendBtn" type="submit">
              SEND
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
