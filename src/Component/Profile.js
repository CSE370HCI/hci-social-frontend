import React from "react";
import "../App.css";

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      firstname: "",
      lastname: "",
      favoritecolor: "",
      responseMessage: ""
    };
    this.fieldChangeHandler.bind(this);
  }

  fieldChangeHandler(field, e) {
    console.log("field change");
    this.setState({
      [field]: e.target.value
    });
  }

  prefChangeHandler(field, e) {
    console.log("pref field change " + field);
    console.log(this.state.favoirtecolor);
    const prefs1 = JSON.parse(JSON.stringify(this.state.favoritecolor));
    console.log(prefs1);
    prefs1.pref_value = e.target.value;
    console.log(prefs1);

    this.setState({
      [field]: prefs1
    });
  }

  componentDidMount() {
    //make the api call to the user API to get the user with all of their attached preferences
    fetch("http://stark.cse.buffalo.edu/hci/usercontroller.php", {
      method: "post",
      body: JSON.stringify({
        action: "getCompleteUsers",
        user_id: this.props.userid
      })
    })
      .then(res => res.json())
      .then(
        result => {
          if (result.users) {
            console.log(result.users);
            let favoritecolor = "";

            // read the user preferences and convert to an associative array for reference

            result.users[0]["user_prefs"].forEach(function(pref) {
              if (pref.pref_name === "FavoriteColor") {
                favoritecolor = pref;
              }
            });

            console.log(favoritecolor);

            this.setState({
              // IMPORTANT!  You need to guard against any of these values being null.  If they are, it will
              // try and make the form component uncontrolled, which plays havoc with react
              username: result.users[0].username || "",
              firstname: result.users[0].first_name || "",
              lastname: result.users[0].last_name || "",
              favoritecolor: favoritecolor
            });
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
    fetch("http://stark.cse.buffalo.edu/hci/usercontroller.php", {
      method: "post",
      body: JSON.stringify({
        action: "addOrEditUsers",
        username: this.state.username,
        firstname: this.state.firstname,
        lastname: this.state.lastname,
        user_id: sessionStorage.getItem("user"),
        session_token: sessionStorage.getItem("token"),
        mode: "ignorenull"
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

    //make the api call to the user prefs controller
    fetch("http://stark.cse.buffalo.edu/hci/upcontroller.php", {
      method: "post",
      body: JSON.stringify({
        action: "addOrEditUserPrefs",
        prefname: "FavoriteColor",
        prefvalue: this.state.favoritecolor.pref_value,
        prefid: this.state.favoritecolor.pref_id,
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
          Username
          <input
            type="text"
            onChange={e => this.fieldChangeHandler("username", e)}
            value={this.state.username}
          />
        </label>
        <label>
          First Name
          <input
            type="text"
            onChange={e => this.fieldChangeHandler("firstname", e)}
            value={this.state.firstname}
          />
        </label>
        <label>
          Last Name
          <input
            type="text"
            onChange={e => this.fieldChangeHandler("lastname", e)}
            value={this.state.lastname}
          />
        </label>
        <label>
          Favorite Color
          <input
            type="text"
            onChange={e => this.prefChangeHandler("favoritecolor", e)}
            value={
              this.state.favoritecolor
                ? this.state.favoritecolor.pref_value
                : ""
            }
          />
        </label>
        <input type="submit" value="submit" />
        <p>Username is : {this.state.username}</p>
        <p>Firstname is : {this.state.firstname}</p>
        {this.state.responseMessage}
      </form>
    );
  }
}
