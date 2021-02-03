import React from "react";
import "../App.css";

export default class FriendList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userid: props.userid,
      connections: []
    };
  }

  componentDidMount() {
    this.loadFriends();
  }

  loadFriends() {

    fetch("http://localhost:3001/api/connections?userID="+sessionStorage.getItem("user"), {
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
            this.setState({
              isLoaded: true,
              connections: result[0]
            });
          }
        },
        error => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
  }

  updateConnection(id, status){
    //make the api call to the user controller
    fetch("http://localhost:3001/api/connections/"+id, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        status: status
      })
    })
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            responseMessage: result.Status
          });
          this.loadFriends();
        },
        error => {
          alert("error!");
        }
      );
  }

  conditionalAction(status, id){
    let block = require("../block_white_216x216.png");
    let unblock = require("../thumbsup.jpg");

    if (status == "active"){
      return(

      <img
        src={block}
        className="sidenav-icon deleteIcon"
        alt="Block User"
        title="Block User"
        onClick={e => this.updateConnection(id, "blocked")}
      />
    )
    }else{
      return(
      <img
        src={unblock}
        className="sidenav-icon deleteIcon"
        alt="Unblock User"
        title="Unblock User"
        onClick={e => this.updateConnection(id, "active")}
      />
    )
    }
  }

  render() {
    //this.loadPosts();
    const {error, isLoaded, connections} = this.state;
    if (error) {
      return <div> Error: {error.message} </div>;
    } else if (!isLoaded) {
      return <div> Loading... </div>;
    } else {
      return (
        <div className="post">
          <ul>
            {connections.map(connection => (
              <div key={connection.id} className="userlist">
                {connection.connectedUser.username} - {connection.status}
                <div className="deletePost">
                {this.conditionalAction(connection.status, connection.id)}
                </div>
              </div>
            ))}
          </ul>
        </div>
      );
    }
  }
}
