import React from "react";
import "../App.css";
import Autocomplete from "./Autocomplete.js";

export default class FriendForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      friendname: "",
      friendid: "",
      responseMessage: "",
      users: []
    };
    this.fieldChangeHandler.bind(this);
  }

  fieldChangeHandler(field, e) {
    console.log("field change");
    this.setState({
      [field]: e.target.value
    });
  }

  componentDidMount() {
    //make the api call to the user API to get the user with all of their attached preferences
    fetch("http://stark.cse.buffalo.edu/hci/usercontroller.php", {
      method: "post",
      body: JSON.stringify({
        action: "getUsers"
      })
    })
      .then(res => res.json())
      .then(
        result => {
          if (result.users) {
            let names = [];
            result.users.forEach(element => names.push(element.name));

            this.setState({
              users: names,
              responseMessage: result.Status
            });
            console.log(names);
          }
        },
        error => {
          alert("error!");
        }
      );
  }

  submitHandler = event => {
    //keep the form from actually submitting
    event.preventDefault();

    //make the api call to the user controller
    fetch("http://stark.cse.buffalo.edu/hci/connectioncontroller.php", {
      method: "post",
      body: JSON.stringify({
        action: "addOrEditConnections",
        connectuserid: this.state.friendid,
        user_id: sessionStorage.getItem("user"),
        session_token: sessionStorage.getItem("token")
      })
    })
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            responseMessage: result.Status
          });
        },
        error => {
          alert("error!");
        }
      );
  };

  render() {
    return (
      <form onSubmit={this.submitHandler} className="profileform">
        <label>
          Find a Friend!
          <br />
          <div className="autocomplete">
            <Autocomplete suggestions={this.state.users} />
          </div>
        </label>

        <input type="submit" value="submit" />

        {this.state.responseMessage}
      </form>
    );
  }
}
