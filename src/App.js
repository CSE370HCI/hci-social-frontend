import React from "react";
import "./App.css";
import PostForm from "./Component/PostForm.js";
import FriendList from "./Component/FriendList.js";
import LoginForm from "./Component/LoginForm.js";
import Profile from "./Component/Profile.js";
import FriendForm from "./Component/FriendForm.js";
import Modal from "./Component/Modal.js";
import {
  BrowserRouter as Router, Route, Switch, Link
} from 'react-router-dom';

class MainContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      section: "main",
      openModal: false
    };
  }

  render() {
    if (this.state.section === "main") {
      return (
        <div>
          <p>Social Media Test Harness</p>
          <LoginForm />
          <PostForm />
        </div>
      );
    } else if (this.state.section === "friends") {
      return (
        <div>
          <p>Friends</p>
          <FriendForm userid={sessionStorage.getItem("user")} />
          <FriendList userid={sessionStorage.getItem("user")} />
        </div>
      );
    } else if (this.state.section === "settings") {
      return (
        <div className="settings">
          <p>Settings</p>
          <Profile userid={sessionStorage.getItem("user")} />
        </div>
      );
    } else {
      return <p>Unidentified Section!</p>;
    }
  }
}

function setMenuOption(mode, maincontent, e) {
  maincontent.current.setState({
    section: mode
  });
}

function toggleModal(app) {
  app.setState({
    openModal: !app.state.openModal
  });
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openModal: false
    };
  }

  render() {
    let post = require("./post.svg");
    let friend = require("./friends.svg");
    let setting = require("./settings.svg");
    let help = require("./help.svg");
    let mainContent = React.createRef();

    return (
      <Router>
      <div className="App">
        <header className="App-header">
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
                  onClick={e => toggleModal(this, e)}
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

          <div className="maincontent" id="mainContent">
            <Switch>
            <Route path="/posts">
              <div>
                <p>Social Media Test Harness</p>
                <LoginForm />
                <PostForm />
              </div>
            </Route>
            <Route path="/settings">
              <div className="settings">
                <p>Settings</p>
                <Profile userid={sessionStorage.getItem("user")} />
              </div>
            </Route>
            <Route path="/friends">
              <div>
                <p>Friends</p>
                <FriendForm userid={sessionStorage.getItem("user")} />
                <FriendList userid={sessionStorage.getItem("user")} />
              </div>
            </Route>
            <Route path="/">
              <div>
                <p>Social Media Home</p>
                <LoginForm />
                <PostForm />
              </div>
            </Route>
            </Switch>
          </div>
        </header>
        <Modal show={this.state.openModal} onClose={e => toggleModal(this, e)}>
          This is a modal dialog!
        </Modal>
      </div>
      </Router>
    );
  }
}

export default App;
