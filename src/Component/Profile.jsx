import React, { useState, useEffect } from "react";
import "../App.css";


// The Profile component shows data from the user table.  This is set up fairly generically to allow for you to customize
// user data by adding it to the attributes for each user, which is just a set of name value pairs that you can add things to
// in order to support your group specific functionality.  In this example, we store basic profile information for the user
const Profile = (props) => {
  // states which contain basic user information/attributes
  // Initially set them all as empty strings to post them to the backend
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
    //keep the form from actually submitting, since we are handling the action ourselves via
    //the fetch calls to the API
    event.preventDefault();
    
    //make the api call to the user controller, and update the user fields (username, firstname, lastname)
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

  // This is the function that draws the component to the screen.  It will get called every time the
  // state changes, automatically.  This is why you see the username and firstname change on the screen
  // as you type them.
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