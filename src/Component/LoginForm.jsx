import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const navigate = useNavigate()

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
      .then(result => {
        if(result.userID){
          // Successfully logged in
          console.log(result)
          // set the auth token and user ID in the session state
          sessionStorage.setItem("token", result.token);
          sessionStorage.setItem("user", result.userID);
          setSessionToken(result.token)
          console.log(sessionToken, " SESSION TOKEN")
          navigate("/")
        }
      })
      .catch(err => {
        console.log(err)
      })
  };

  return (
    <>
      {!sessionStorage.getItem("token") ? (
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
      ) : email ? (
        <p>Welcome, {email}</p>
      ) : (
        <p>Something</p>
      )}
    </>
  );
};

export default LoginForm;

// import React from "react";

// import "../App.css";

// // the login form will display if there is no session token stored.  This will display
// // the login form, and call the API to authenticate the user and store the token in
// // the session.

// export default class LoginForm extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       username: "",
//       password: "",
//       alanmessage: "",
//       sessiontoken: ""
//     };
//     this.refreshPostsFromLogin = this.refreshPostsFromLogin.bind(this);
//   }

//   // once a user has successfully logged in, we want to refresh the post
//   // listing that is displayed.  To do that, we'll call the callback passed in
//   // from the parent.
//   refreshPostsFromLogin(){
//     console.log("CALLING LOGIN IN LOGINFORM");
//     this.props.login();
//   }

//   // change handlers keep the state current with the values as you type them, so
//   // the submit handler can read from the state to hit the API layer
//   myChangeHandler = event => {
//     this.setState({
//       username: event.target.value
//     });
//   };

//   passwordChangeHandler = event => {
//     this.setState({
//       password: event.target.value
//     });
//   };

//   // when the user hits submit, process the login through the API
//   submitHandler = event => {
//     //keep the form from actually submitting
//     event.preventDefault();

//     //make the api call to the authentication page
//     fetch(process.env.REACT_APP_API_PATH+"/auth/login", {
//       method: "post",
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email: this.state.username,
//         password: this.state.password
//       })
//     })
//       .then(res => res.json())
//       .then(
//         result => {
//           console.log("Testing");
//           if (result.userID) {

            // // set the auth token and user ID in the session state
            // sessionStorage.setItem("token", result.token);
            // sessionStorage.setItem("user", result.userID);

//             this.setState({
//               sessiontoken: result.token,
//               alanmessage: result.token
//             });

//             // call refresh on the posting list
//             this.refreshPostsFromLogin();
//           } else {

//             // if the login failed, remove any infomation from the session state
//             sessionStorage.removeItem("token");
//             sessionStorage.removeItem("user");
//             this.setState({
//               sessiontoken: "",
//               alanmessage: result.message
//             });
//           }
//         },
//         error => {
//           alert("error!");
//         }
//       );
//   };

//   render() {
//     // console.log("Rendering login, token is " + sessionStorage.getItem("token"));

//     if (!sessionStorage.getItem("token")) {
//       return (
//         <form onSubmit={this.submitHandler}>
//           <label>
//             Username
//             <input type="text" onChange={this.myChangeHandler} />
//           </label>
//           <br />
//           <label>
//             Password
//             <input type="password" onChange={this.passwordChangeHandler} />
//           </label>
//           <input type="submit" className="submitbutton" value="submit" />
//           <p>{this.state.alanmessage}</p>
//         </form>
//       );
//     } else {
//       console.log("Returning welcome message");
//       if (this.state.username) {
//         return <p>Welcome, {this.state.username}</p>;
//       } else {
//         return <p>{this.state.alanmessage}</p>;
//       }
//     }
//   }
// }
