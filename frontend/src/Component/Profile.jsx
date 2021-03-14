import React from "react";
import "../App.css";

// The Profile component combines data from two sources, user and user_preferences.  You'll notice that there are 
// two fetch calls to load the information in componentDidMount, and two to save it in the submitHandler, one for 
// each of those data sources.  Note that there are many write outs to the console to help you track what's happening
// feel free to comment those out or delete them when you're ready to go to "production".

export default class Profile extends React.Component {
  
  // The constructor will hold the default values for the state.  This is also where any props that are passed
  // in when the component is instantiated will be read and managed.  
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      firstname: "",
      lastname: "",
      favoritecolor: "",
      responseMessage: ""
      // NOTE : if you wanted to add another user preference object to the profile, you would add a corresponding state element here
    };
    this.fieldChangeHandler.bind(this);
  }

  // This is the function that will get called every time we change one of the fields tied to the user data source (username, firstname, lastname).
  // it keeps the state current so that when we submit the form, we can pull the value to update from the state.  Note that
  // we manage multiple fields with one function and no conditional logic, because we are passing in the name of the state
  // object as an argument to this method.  
  fieldChangeHandler(field, e) {
    console.log("field change");
    this.setState({
      [field]: e.target.value
    });
  }

  // This is the function that will get called every time we change one of the fields tied to the user_preferences data source (favoritecolor).
  // It's a separate function fom fieldChangeHandler, because the objects we're maintaining are objects rather than just strings, so that
  // we can track which user_preference id we want to change.
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

  // This is the function that will get called the first time that the component gets rendered.  This is where we load the current
  // values from the database via the API, and put them in the state so that they can be rendered to the screen.  
  componentDidMount() {
    console.log("In profile");
    console.log(this.props);

    // first fetch the user data to allow update of username, firstname, and lastname
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

    //make the api call to the user_preference API to get the user preferences (in this case, we only care about favoritecolor).
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
            // NOTE : if you wanted to add another user preference to the profile, you would declare a default placeholder here,
            // like we declare favoritecolor above.

            // read the user preferences and convert to an associative array for reference
            result[0].forEach(function(pref) {
              if (pref.name === "favoritecolor") {
                favoritecolor = pref;
              }
              // NOTE : if you wanted to add another user preference to the profile, you would have another conditional block here
              // looking for that preference name, just like we're looking for favoritecolor above.
            });

            console.log(favoritecolor);

            this.setState({
              // IMPORTANT!  You need to guard against any of these values being null.  If they are, it will
              // try and make the form component uncontrolled, which plays havoc with react
              favoritecolor: favoritecolor
              // NOTE : if you wanted to add another user preference to the profile, you would set the value in the state here.
            });
          }
        },
        error => {
          alert("error!");
        }
      );
  }

  // This is the function that will get called when the submit button is clicked, and it stores
  // the current values to the database via the api calls to the user and user_preferences endpoints
  submitHandler = event => {
    
    //keep the form from actually submitting, since we are handling the action ourselves via
    //the fetch calls to the API
    event.preventDefault();

    //make the api call to the user controller, and update the user fields (username, firstname, lastname)
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


    // NOTE : If you wanted to add additional user preferences to the profile, 
    // you would need to make an additional fetch call below for each one that
    // you added.  Creating a new function for this would be a good plan if you added
    // a lot of additional fields. 
    let url = process.env.REACT_APP_API_PATH+"/user-preferences";
    let method = "POST";  // default to post, because the first time there will be no id to update
    let value = this.state.favoritecolor;

    // if we did read a value from the API, switch from POST to PATCH, and add the id of the 
    // preference to the URL.
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

  // This is the function that draws the component to the screen.  It will get called every time the
  // state changes, automatically.  This is why you see the username and firstname change on the screen
  // as you type them.
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
