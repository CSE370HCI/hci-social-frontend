import React, { useState, useEffect } from "react";
import "../App.css";

const Profile = (props) => {
  // Replace constructor and this.state
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [favoriteColor, setFavoriteColor] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  // Replace componentDidMount for fetching data
  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem(
        "user"
      )}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    )
      .then((res) => res.json())
      .then((result) => {
        if (result && result.attributes) {
          setUsername(result.attributes.username || "");
          setFirstName(result.attributes.firstName || "");
          setLastName(result.attributes.lastName || "");
          setFavoriteColor(result.attributes.favoritecolor || "");
        }
      })
      .catch((error) => {
        alert("error!");
      });
  }, []);

  // This is the function that will get called the first time that the component gets rendered.  This is where we load the current
  // values from the database via the API, and put them in the state so that they can be rendered to the screen.
  const submitHandler = (event) => {
    event.preventDefault();
    fetch(
      `${process.env.REACT_APP_API_PATH}/users/${sessionStorage.getItem(
        "user"
      )}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          attributes: {
            username: username,
            firstName: firstName,
            lastName: lastName,
            favoritecolor: favoriteColor,
          },
        }),
      }
    )
      .then((res) => res.json())
      .then((result) => {
        setResponseMessage(result.Status);
      })
      .catch((error) => {
        alert("error!");
      });
  };

  return (
    <form onSubmit={submitHandler} className="profileform">
      <label>
        Username
        <input
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </label>
      <label>
        First Name
        <input
          type="text"
          onChange={(e) => setFirstName(e.target.value)}
          value={firstName}
        />
      </label>
      <label>
        Last Name
        <input
          type="text"
          onChange={(e) => setLastName(e.target.value)}
          value={lastName}
        />
      </label>
      <label>
        Favorite Color
        <input
          type="text"
          onChange={(e) => setFavoriteColor(e.target.value)}
          value={favoriteColor}
        />
      </label>
      <input type="submit" value="submit" />
      <p>Username is : {username}</p>
      <p>Firstname is : {firstName}</p>
      {responseMessage}
    </form>
  );
};

export default Profile;