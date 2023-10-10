import React, { useState, useEffect } from "react";
import Autocomplete from "./Autocomplete.jsx";

const FriendForm = ({ userid }) => {
  const [friendname, setFriendname] = useState("");
  const [friendid, setFriendid] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch data and update users state
    fetch(process.env.REACT_APP_API_PATH + "/users/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then(
        (result) => {
          if (result) {
            let names = [];
            result[0].forEach((element) => {
              if (element.attributes && element.attributes.username) {
                names.push(element);
              }
            });
            setUsers(names);
            setResponseMessage(result.Status);
          }
        },
        (error) => {
          alert("error!");
        }
      );
  }, []); // Empty dependency array ensures this effect runs once after the initial render

  const fieldChangeHandler = (field, e) => {
    console.log("field change");
    setFriendname(e.target.value);
  };

  const selectAutocomplete = (friendID) => {
    setFriendid(friendID);
    console.log("Set Friend ID to " + friendID);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    console.log("friend is ");
    console.log(friendid);

    // Make the API call to the user controller
    fetch(process.env.REACT_APP_API_PATH + "/connections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      body: JSON.stringify({
        toUserID: friendid,
        fromUserID: sessionStorage.getItem("user"),
        attributes: { type: "friend", status: "active" },
      }),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          setResponseMessage(result.Status);
        },
        (error) => {
          alert("error!");
        }
      );
  };

  return (
    <form onSubmit={submitHandler} className="profileform">
      <label>
        Find a Friend!
        <br />
        <div className="autocomplete">
          <Autocomplete
            suggestions={users}
            selectAutocomplete={(e) => selectAutocomplete(e)}
          />
        </div>
      </label>
      <input type="submit" value="submit" />
      {responseMessage}
    </form>
  );
};

export default FriendForm;

// import React from "react";
// import "../App.css";
// import Autocomplete from "./Autocomplete.jsx";

// export default class FriendForm extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       friendname: "",
//       friendid: "",
//       responseMessage: "",
//       users: []
//     };
//     this.fieldChangeHandler.bind(this);
//   }

//   fieldChangeHandler(field, e) {
//     console.log("field change");
//     this.setState({
//       [field]: e.target.value
//     });
//   }

//   selectAutocomplete(friendID) {
//       this.setState({
//         friendid:friendID
//       })
//       console.log("Set Friend ID to "+friendID)
//   }

//   componentDidMount() {
//     //make the api call to the user API to get the user with all of their attached preferences
//     fetch(process.env.REACT_APP_API_PATH+"/users/", {
//       method: "GET",
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer '+sessionStorage.getItem("token")
//       }

//     })
//       .then(res => res.json())
//       .then(
//         result => {
//           if (result) {
//             let names = [];

//             result[0].forEach(element => {if (element.attributes.username){names.push(element)}});

//             this.setState({
//               users: names,
//               responseMessage: result.Status
//             });
//             console.log(names);
//           }
//         },
//         error => {
//           alert("error!");
//         }
//       );
//   }

//   submitHandler = event => {
//     //keep the form from actually submitting
//     event.preventDefault();

//     console.log("friend is ");
//     console.log(this.state.friendid);

//     //make the api call to the user controller
//     fetch(process.env.REACT_APP_API_PATH+"/connections", {
//       method: "POST",
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer '+sessionStorage.getItem("token")
//       },
//       body: JSON.stringify({
//         toUserID: this.state.friendid,
//         fromUserID: sessionStorage.getItem("user"),
//         attributes:{type:"friend", status:"active"}
//       })
//     })
//       .then(res => res.json())
//       .then(
//         result => {
//           this.setState({
//             responseMessage: result.Status
//           });
//         },
//         error => {
//           alert("error!");
//         }
//       );
//   };

//   render() {
//     return (
//       <form onSubmit={this.submitHandler} className="profileform">
//         <label>
//           Find a Friend!
//           <br />
//           <div className="autocomplete">
//             <Autocomplete suggestions={this.state.users} selectAutocomplete={e => this.selectAutocomplete(e)} />
//           </div>
//         </label>
//         <input type="submit" value="submit" />
//         {this.state.responseMessage}
//       </form>
//     );
//   }
// }
