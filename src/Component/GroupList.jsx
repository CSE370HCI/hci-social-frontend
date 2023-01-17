import React from "react";
import "../App.css";
import blockIcon from "../assets/block_white_216x216.png";
import unblockIcon from "../assets/thumbsup.png";
import deleteIcon from "../assets/delete.png";

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

  // This will load all the available groups.
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
          // now, pull all the groups that the current user belongs to.  This allows us to mark each groups
          // membership status
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

  // THIS IS AN EXAMPLE CALL ONLY
  // if you want to update a group, this will update the name of group 1 to "test".  
  // Naturally, you would want to make sure that the user was the owner of the
  // group, and allow them to type in new information, etc.
  testGroupUpdate = () => {
    fetch(process.env.REACT_APP_API_PATH+"/groups/1", {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        name:"test",
        attributes:{test:"test"}
      })
     })
      .then(res => res.json())
      .then(
        result => {
          this.loadGroups();
        }
      )
  }

  // THIS IS AN EXAMPLE CALL ONLY
  // if you want to add a group, you would probably want to let the user define all of this!
 
  testGroupAdd = () => {
    fetch(process.env.REACT_APP_API_PATH+"/groups", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        name:"Test ADD Group",
        attributes:{test:"test"}
      })
     })
      .then(res => res.json())
      .then(
        result => {
          this.loadGroups();
        }
      )
  }

  // THIS IS AN EXAMPLE CALL ONLY - it lets anyone delete the group, and it doesn't do any 
  // clean up of group members... 
  deleteGroup = (gid) => {
    fetch(process.env.REACT_APP_API_PATH+"/groups/"+gid, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      }
     })
     .then(
      result => {
        this.loadGroups();
      }
    )
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

  // updateConnection will toggle the membership of the current user in the selected group.
  // if they are active, this makes them inactive, and vice-versa.
  updateConnection(id, status){
    //make the api call to the group-members list
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

  // This method will render the icon indicating group membership.  If the list of current groups
  // for the logged in user includes this group, we'll show the block icon (you will naturally want to pick a better one)
  // and if not, it shows the unblock icon.  It also sets the clickhandler for the icons to the 
  // appropriate update call, to either add or remove the current user from that group.
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

  // Draw the list of available groups to the screen, and for each one, 
  // indicate if the current user is a member or not.  Note that this uses 
  // poorly named styles borrowed from other screens - you would probably want
  // to update those to be specific to the way you manage groups.
  render() {
   
    const {error, isLoaded, groups} = this.state;
    if (error) {
      return <div> Error: {error.message} </div>;
    } else if (!isLoaded) {
      return <div> Loading... </div>;
    } else {
      return (
        <div>
          <ul>
            {groups.map(group => (
              <div key={group.id} className="userlist">
                {group.name} 
                <div className="deletePost">
                  {this.conditionalAction(group.id)}
                  <img
                    src={deleteIcon}
                    className="sidenav-icon deleteIcon"
                    alt="Delete Group"
                    title="Delete Group"
                    onClick={e => this.deleteGroup(group.id)}
                  />
                </div>
              </div>
            ))}
          </ul>
          <button onClick={this.testGroupUpdate}>Test Update</button>
          <button onClick={this.testGroupAdd}>Test Add</button>
        </div>
      );
    }
  }
}
