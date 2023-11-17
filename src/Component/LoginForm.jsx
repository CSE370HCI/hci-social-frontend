import React, { useEffect, useState } from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";

const LoginForm = ({ setLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const navigate = useNavigate();

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
          setLoggedIn(true);
          setSessionToken(result.token);
          console.log(sessionToken, " SESSION TOKEN");
          // go to the homepage
          navigate("/");
          window.location.reload();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <h1>Login</h1>
      <form onSubmit={submitHandler}>
        <label>
          Email
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
      <div>
        <p>
          Register <Link to="/register">here</Link>
        </p>
      </div>
      <div>
        <p>
          Reset your password <Link to="/reset-password">here</Link>
        </p>
      </div>
    </>
  );
};

export default LoginForm;
