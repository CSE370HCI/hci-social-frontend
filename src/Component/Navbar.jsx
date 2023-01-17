import React from "react";
import "../App.css";
import {
   Link
} from 'react-router-dom';
// pull in the images for the menu items
import postIcon from "../assets/post.svg";
import friendIcon from "../assets/friends.svg";
import settingIcon from "../assets/settings.svg";
import helpIcon from "../assets/help.svg";
import exitIcon from "../assets/exit.png";
import groupIcon from "../assets/group.png";

/* The Navbar class provides navigation through react router links.  Note the callback
   to the parent app class in the last entry... this is an example of calling a function
   passed in via props from a parent component */
class Navbar extends React.Component {

  render() {
    return (
    <div id="sidenav" className="sidenav">
      <ul id="side-menu-items">
        <li className="pm admin student">
          <Link to="/posts">
            <img
              src={postIcon}
              className="sidenav-icon"
              alt="Posts"
              title="Posts"
            />
          </Link>
        </li>
        <li className="pm admin">
          <Link to="/friends">
            <img
              src={friendIcon}
              className="sidenav-icon"
              alt="Friends"
              title="Friends"
            />
          </Link>
        </li>
        <li className="pm admin">
          <Link to="/settings">
            <img
              src={settingIcon}
              className="sidenav-icon"
              alt="Settings"
              title="Settings"
            />
          </Link>
        </li>
        <li className="pm admin">
          <button
            className="link-button"
            onClick={e => this.props.toggleModal(e)}
          >
            <img
              src={helpIcon}
              className="sidenav-icon"
              alt="Modal"
              title="Modal"
            />
          </button>
        </li>
        <li className="pm admin">
        <button
            className="link-button"
            onClick={e => this.props.logout(e)}
          >
            <img
              src={exitIcon}
              className="sidenav-icon"
              alt="Logout"
              title="Logout"
            />
          </button>
        </li>
        <li className="pm admin">
          <Link to="/groups">
            <img
              src={groupIcon}
              className="sidenav-icon"
              alt="groups"
              title="groups"
            />
          </Link>
        </li>
      </ul>
    </div>
  );
  }

}
export default Navbar;
