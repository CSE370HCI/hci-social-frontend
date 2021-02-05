import React from "react";
import "../App.css";
import {
   Link
} from 'react-router-dom';

/* The Navbar class provides navigation through react router links.  Note the callback
   to the parent app class in the last entry... this is an example of calling a function
   passed in via props from a parent component */
class Navbar extends React.Component {

  render() {

    // pull in the images for the menu items
    let post = require("../assets/post.svg");
    let friend = require("../assets/friends.svg");
    let setting = require("../assets/settings.svg");
    let help = require("../assets/help.svg");

    return (
    <div id="sidenav" className="sidenav">
      <ul id="side-menu-items">
        <li className="pm admin student">
          <Link to="/posts">
            <img
              src={post}
              className="sidenav-icon"
              alt="Posts"
              title="Posts"
            />
          </Link>
        </li>
        <li className="pm admin">
          <Link to="/friends">
            <img
              src={friend}
              className="sidenav-icon"
              alt="Friends"
              title="Friends"
            />
          </Link>
        </li>
        <li className="pm admin">
          <Link to="/settings">
            <img
              src={setting}
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
              src={help}
              className="sidenav-icon"
              alt="Settings"
              title="Settings"
            />
          </button>
        </li>
      </ul>
    </div>
  );
  }

}
export default Navbar;
