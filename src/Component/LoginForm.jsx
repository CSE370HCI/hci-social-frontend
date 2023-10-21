import React, { useState } from "react";
import "../App.css";

const LoginForm = ({ setLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  const submitHandler = (event) => {
    // event.preventDefault() prevents the browser from performing its default action
    // In this instance, it will prevent the page from reloading
    // keeps the form from actually submitting as well
    event.preventDefault();

    fetch(process.env.REACT_APP_API_PATH + "/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.userID) {
          // Successfully logged in
          console.log(result);
          // set the auth token and user ID in the session state
          sessionStorage.setItem("token", result.token);
          sessionStorage.setItem("user", result.userID);
          // call setLoggedIn hook from App.jsx to save the login state throughout the app
          setLoggedIn(true)
          setSessionToken(result.token);
          console.log(sessionToken, " SESSION TOKEN");
          window.location.reload();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <form onSubmit={submitHandler}>
        <label>
          Username
          <input
            type="email"
            // event.target refers to the DOM that is triggered from an event, such as onChange, onClick, etc.
            // event.target.value holds the value that is passed in to the input field from the onChange
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <br />
        <label>
          Password
          <input
            type="password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <input type="submit" className="submitbutton" value="submit" />
      </form>
    </>
  );
};

export default LoginForm;