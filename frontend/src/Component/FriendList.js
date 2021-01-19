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
    fetch("http://stark.cse.buffalo.edu/hci/connectioncontroller.php", {
      method: "post",
      body: JSON.stringify({
        action: "getConnections",
        user_id: this.state.userid
      })
    })
      .then(res => res.json())
      .then(
        result => {
          if (result.connections) {
            this.setState({
              isLoaded: true,
              connections: result.connections
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
              <div key={connection.connection_id} className="userlist">
                {connection.name} - {connection.connection_status}
              </div>
            ))}
          </ul>
        </div>
      );
    }
  }
}
