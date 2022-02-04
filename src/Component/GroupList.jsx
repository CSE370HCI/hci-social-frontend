import React from "react";
import "../App.css";
import blockIcon from "../assets/block_white_216x216.png";
import unblockIcon from "../assets/thumbsup.png";

export default class GroupList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userid: props.userid,
      groups: [],
      mygroups: [],
      mygroupIDs: []
    };
  }

  componentDidMount() {
    this.loadGroups();
  }

  loadGroups() {

    fetch(process.env.REACT_APP_API_PATH+"/groups", {
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
              groups: result[0]
            });
          }
          fetch(process.env.REACT_APP_API_PATH+"/group-members?userID="+sessionStorage.getItem("user"), {
            method: "get",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer '+sessionStorage.getItem("token")
            }
           })
            .then(res2 => res2.json())
            .then(
              result2 => {
                if (result2) {
                  let memberships = [];
                  let membershipIDs = [];
                  if (Array.isArray(result2)){
                    console.log("GOT MEMBERS ", result2[0]);
                    membershipIDs = result2[0].map(groupmember => groupmember.groupID);
                    memberships = result2[0];
                    console.log("GROUP LIST", memberships);
                  }else{
                    membershipIDs.push(result2.groupID);
                    memberships.push(result2);
                  }
                  this.setState({
                    isLoaded: true,
                    mygroupIDs: membershipIDs,
                    mygroups:memberships
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
        },
        error => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
  }

  getGroupMemberId = (groupid) => {
    console.log("LOOKING FOR GROUP", groupid);
    for (const membership of this.state.mygroups) {
      console.log("MEMBERSHIP",membership);
      if(membership.groupID === groupid){
        console.log("returning ", membership.id);
        return membership.id;
      }else{
        console.log(membership.groupID, "is not ", groupid)
      }
    };
    return -1;
  }

  updateConnection(id, status){
    //make the api call to the user controller
    if (status === "inactive"){
      fetch(process.env.REACT_APP_API_PATH+"/group-members/"+this.getGroupMemberId(id), {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+sessionStorage.getItem("token")
        },
        
      })
        .then(response => {
          if (response.status === 204){
            //alert("deleted");
          }else if (response.status === 404){
            //alert("membership not found");
          }
          this.setState({
            responseMessage: response.Status
          });
          console.log("LOADING GROUPS");
          this.loadGroups();
        }
        );
    }else{
      fetch(process.env.REACT_APP_API_PATH+"/group-members", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+sessionStorage.getItem("token")
        },
        body: JSON.stringify({
          userID:sessionStorage.getItem("user"),
          groupID:id
        })
      })
        .then(res => res.json())
        .then(
          result => {
            this.setState({
              responseMessage: result.Status
            });
            this.loadGroups();
          },
          error => {
            alert("error!");
          }
        );
    }
  }

  conditionalAction(id){
    if (this.state.mygroupIDs.includes(id)){
      return(

      <img
        src={blockIcon}
        className="sidenav-icon deleteIcon"
        alt="Block User"
        title="Block User"
        onClick={e => this.updateConnection(id, "inactive")}
      />
    )
    }else{
      return(
      <img
        src={unblockIcon}
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
    const {error, isLoaded, groups} = this.state;
    if (error) {
      return <div> Error: {error.message} </div>;
    } else if (!isLoaded) {
      return <div> Loading... </div>;
    } else {
      return (
        <div className="post">
          <ul>
            {groups.map(group => (
              <div key={group.id} className="userlist">
                {group.name} 
                <div className="deletePost">
                  {this.conditionalAction(group.id)}
                </div>
              </div>
            ))}
          </ul>
        </div>
      );
    }
  }
}
