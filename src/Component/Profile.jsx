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
  const [picture, setPicture] = useState("");

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
          // if the attributes already exists and they are stored, set the states to those attributes
          // so that nothing gets overwritten
          setUsername(result.attributes.username || "");
          setFirstName(result.attributes.firstName || "");
          setLastName(result.attributes.lastName || "");
          setFavoriteColor(result.attributes.favoritecolor || "");
          setPicture(result.attributes.picture || "");
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
            picture: picture,
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

  const uploadPicture = (event) => {
    event.preventDefault();

    // event.target.files[0] holds the file object that the user is uploading
    const file = event.target.files[0];

    // FormData objects are used to capture HTML form and submit it using fetch or another network method.
    // provides a way to construct a set of key/value pairs representing form fields and their values
    // we can use this formData to send the attributes for the file-uploads endpoint
    const formData = new FormData();

    formData.append("uploaderID", sessionStorage.getItem("user")); // the id of the user who is uploading the file
    formData.append("attributes", JSON.stringify({})); // attributes holds an empty object, can put whatever you want here
    formData.append("file", file); // the file itself

    // make api call to file-uploads endpoint to post the profile picture
    fetch(process.env.REACT_APP_API_PATH + "/file-uploads", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      body: formData, // send the formdata to the backend
    })
      .then((res) => res.json())
      .then((result) => {
        // pictureURL holds the url of where the picture is stored to show on the page
        let pictureURL = "https://webdev.cse.buffalo.edu" + result.path;
        setPicture(pictureURL);
      });
  };

  // This is the function that draws the component to the screen.  It will get called every time the
  // state changes, automatically.  This is why you see the username and firstname change on the screen
  // as you type them.
  return (
    <>
      <img src={picture} alt="profile" />
      <form onSubmit={submitHandler} className="profileform">
        <label>
          Picture
          <input type="file" accept="image/*" onChange={uploadPicture} />
        </label>
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
    </>
  );
};

export default Profile;
