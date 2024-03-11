import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const RegisterForm = ({ setLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // You can assign the user extra attributes for when they register an account.
  // As you can see on swagger, attributes is optional where its an object and you
  // can store extra attributes like profile picture, favorite color, etc.
  // to fill out when the user creates an account.
  const [attributes, setAttributes] = useState({
    additionalProp1: {},
  });
  const navigate = useNavigate();

  const submitHandler = (event) => {
    // event.preventDefault() prevents the browser from performing its default action
    // In this instance, it will prevent the page from reloading
    // keeps the form from actually submitting as well
    event.preventDefault();

    console.log("my data", {
      email,
      password,
    })
    
    console.log("sending to", process.env.REACT_APP_API_PATH + "/auth/signup")

    fetch(process.env.REACT_APP_API_PATH + "/auth/signup", {
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
        // Successfully registered an account
        console.log(result);
        // set the auth token and user ID in the session state
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("user", result.userID);
        // call setLoggedIn hook from App.jsx to save the login state throughout the app
        setLoggedIn(true);
        // Reload the window for when the user logs in to show the posts
        navigate("/");
        window.location.reload();
      });
  };

  useEffect(() => {
    // If the user is logged in, make sure they cannot see the login form
    if (sessionStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

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
            onChange={(event) => {
              console.log(event, event.target.value)
              setEmail(event.target.value)}
            }
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
      <div>
        <p>
          Reset your password <Link to="/reset-password">here</Link>
        </p>
      </div>
    </>
  );
};

export default RegisterForm;
