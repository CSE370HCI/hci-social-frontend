import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
const Navbar = ({ toggleModal, logout }) => {

  const root = document.querySelector(':root');

  const setVariables = vars => Object.entries(vars).forEach(v => root.style.setProperty(v[0], v[1]));
  const darkModeVariables = {
    "--red":"#AE445A",
    "--bg": "black",
    "--font": "#F39F5A",
    "--button-bg": "#451952",
    "--accent": "#662549",
    "--positive": "green",
    "--positive-text": "#662549",
    "--comment-bg":"#F39F5A",
    "--comment-text":"#EF39F5A",
    "--comment-accent":"#662549",
  };

  const lightModeVariables = {
    "--red":"red",
    "--bg": "#7c2667",
    "--font": "white",
    "--button-bg": "blue",
    "--accent": "#999",
    "--positive": "green",
    "--positive-text": "yellow",
    "--comment-bg":"white",
    "--comment-text":"black",
    "--comment-accent":"lightblue",
  };

  let modes = [lightModeVariables, darkModeVariables]
  let labels = ["light", "dark"]

  const [mode, setMode] = useState(sessionStorage.getItem("mode")? parseInt(sessionStorage.getItem("mode")) : 0)

  useEffect(() => {
    setVariables(modes[mode])
  }, [mode, ])


  return (
    <div id="sidenav" className="sidenav">
      <ul id="side-menu-items">
        <li className="pm admin student">
          <Link to="/">
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
            onClick={toggleModal}
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
          <button className="link-button" onClick={logout}>
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

        <li className="pm admin">
          <button onClick={() => 
            {
              if (mode == 1){
                setMode(0)
                sessionStorage.setItem("mode", 0)
              } else{
                setMode(1)
                sessionStorage.setItem("mode", 1)
              }
            }
            }>{labels[(mode+1) % 2]} mode</button>
        </li>
      </ul>
    </div>
  );
};

export default Navbar;