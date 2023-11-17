import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // You can assign the user extra attributes for when they register an account.
  // As you can see on swagger, attributes is optional where its an object and you
  // can store extra attributes like profile picture, favorite color, etc.
  // to fill out when the user creates an account.
  const [attributes, setAttributes] = useState({});

  const submitHandler = (event) => {
    // event.preventDefault() prevents the browser from performing its default action
    // In this instance, it will prevent the page from reloading
    // keeps the form from actually submitting as well
    event.preventDefault();

    fetch(process.env.REACT_APP_API_PATH + "/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        attributes,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        // Successfully registered an account
        console.log(result);
        // set the auth token and user ID in the session state
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("user", result.userID);
      });
  };

  return (
    <>
      <h1>Register</h1>
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
          Login <Link to="/">here</Link>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;
