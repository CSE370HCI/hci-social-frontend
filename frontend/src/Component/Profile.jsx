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
    console.log(this.state.favoritecolor);
    const prefs1 = JSON.parse(JSON.stringify(this.state.favoritecolor));
    console.log(prefs1);
    prefs1.value = e.target.value;
    console.log(prefs1);

    this.setState({
      [field]: prefs1
    });
  }

  componentDidMount() {
    console.log("In profile");
    console.log(this.props);

    // first fetch the user data to allow update of username
    fetch(process.env.REACT_APP_API_PATH+"/users/"+sessionStorage.getItem("user"), {
      method: "get",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(
        result => {
          if (result) {
            console.log(result);

            this.setState({
              // IMPORTANT!  You need to guard against any of these values being null.  If they are, it will
              // try and make the form component uncontrolled, which plays havoc with react
              username: result.username || "",
              firstname: result.firstName || "",
              lastname: result.lastName || ""

            });
          }
        },
        error => {
          alert("error!");
        }
      );

    //make the api call to the user API to get the user with all of their attached preferences
    fetch(process.env.REACT_APP_API_PATH+"/user-preferences?userID="+sessionStorage.getItem("user"), {
      method: "get",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(
        result => {
          if (result) {
            console.log(result);
            let favoritecolor = "";

            // read the user preferences and convert to an associative array for reference

            result[0].forEach(function(pref) {
              if (pref.name === "favoritecolor") {
                favoritecolor = pref;
              }
            });

            console.log(favoritecolor);

            this.setState({
              // IMPORTANT!  You need to guard against any of these values being null.  If they are, it will
              // try and make the form component uncontrolled, which plays havoc with react
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
    fetch(process.env.REACT_APP_API_PATH+"/users/"+sessionStorage.getItem("user"), {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({

        username: this.state.username,
        firstName: this.state.firstname,
        lastName: this.state.lastname,

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

    let url = process.env.REACT_APP_API_PATH+"/user-preferences";
    let method = "POST";
    let value = this.state.favoritecolor;

    if (this.state.favoritecolor && this.state.favoritecolor.id){
      url += "/"+this.state.favoritecolor.id;
      method = "PATCH";
      value = this.state.favoritecolor.value;
    }


    //make the api call to the user prefs controller
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        name: "favoritecolor",
        value: value,
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
                ? this.state.favoritecolor.value
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
