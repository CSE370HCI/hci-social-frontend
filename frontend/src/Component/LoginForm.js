import React from "react";
import "../App.css";

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      alanmessage: "",
      sessiontoken: ""
    };
  }

  myChangeHandler = event => {
    this.setState({
      username: event.target.value
    });
  };

  passwordChangeHandler = event => {
    this.setState({
      password: event.target.value
    });
  };

  submitHandler = event => {
    //keep the form from actually submitting
    event.preventDefault();

    //make the api call to the authentication page
    fetch("http://stark.cse.buffalo.edu/hci/SocialAuth.php", {
      method: "post",
      body: JSON.stringify({
        action: "login",
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(res => res.json())
      .then(
        result => {
          console.log("Testing");
          if (result.user) {
            sessionStorage.setItem("token", result.user.session_token);
            sessionStorage.setItem("user", result.user.user_id);

            this.setState({
              sessiontoken: result.user.session_token,
              alanmessage: result.user.session_token
            });
          } else {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            this.setState({
              sessiontoken: "",
              alanmessage: result.message
            });
          }
        },
        error => {
          alert("error!");
        }
      );
  };

  render() {
    console.log("Rendering login, token is " + sessionStorage.getItem("token"));
    if (!sessionStorage.getItem("token")) {
      return (
        <form onSubmit={this.submitHandler}>
          <label>
            Username
            <input type="text" onChange={this.myChangeHandler} />
          </label>
          <br />
          <label>
            Password
            <input type="password" onChange={this.passwordChangeHandler} />
          </label>
          <input type="submit" value="submit" />
          <p>{this.state.alanmessage}</p>
        </form>
      );
    } else {
      console.log("Returning welcome message");
      if (this.state.username) {
        return <p>Welcome, {this.state.username}</p>;
      } else {
        return <p>{this.state.alanmessage}</p>;
      }
    }
  }
}
