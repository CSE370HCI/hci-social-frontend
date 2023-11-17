import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// example of how you can set up a component to request a password reset for an account
// The only thing you need to do is send the email of the account to the backend api route and then
// the email will get a code and you use that code with the reset-password route
// (You can see more on the swagger API documentation)
const ResetPassword = () => {
  const [email, setEmail] = useState("");
  // State used to conditionally render different forms
  // When the user gets the token, this is set to true to show the second form to input a new password
  const [gotToken, setGotToken] = useState(false);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleResetRequest = (event) => {
    event.preventDefault();

    // fetch the api route to send a reset password request
    fetch(process.env.REACT_APP_API_PATH + "/auth/request-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    }).then((res) => {
      // the request successfully worked, so set gotToken state to true
      if (res.ok) {
        setGotToken(true);
      }
    });
  };

  const handleResetPassword = (event) => {
    event.preventDefault();

    fetch(process.env.REACT_APP_API_PATH + "/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    }).then((res) => {
      if (res.ok) {
        // New password submitted, so have them go to login page to login with new password
        navigate("/");
      }
    });
  };

  return (
    <>
      <h1>Reset password</h1>
      {/* Conditionally render the different forms:
          When the user first see's this component, show them the form to enter their email to get the token
          Once they submit this form, they get the token in their email and the form changes to the form where
          they can enter a new password to reset it 
      */}
      {!gotToken ? (
        <form onSubmit={handleResetRequest}>
          <label>
            Email
            <input
              type="email"
              value={email}
              // event.target refers to the DOM that is triggered from an event, such as onChange, onClick, etc.
              // event.target.value holds the value that is passed in to the input field from the onChange
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <input type="submit" className="submitbutton" value="submit" />
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <label>
            Token
            <input
              type="text"
              value={token}
              // event.target refers to the DOM that is triggered from an event, such as onChange, onClick, etc.
              // event.target.value holds the value that is passed in to the input field from the onChange
              onChange={(event) => setToken(event.target.value)}
            />
          </label>
          <br />
          <label>
            New Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <input type="submit" className="submitbutton" value="submit" />
        </form>
      )}
      <div>
        <p>
          Login <Link to="/">here</Link>
        </p>
      </div>
    </>
  );
};

export default ResetPassword;
