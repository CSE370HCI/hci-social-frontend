import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Settings from "./Component/Settings";
import HomePage from "./Component/HomePage";
import Navbar from "./Component/Navbar";
import Friends from "./Component/Friends";
import Groups from "./Component/Groups";
import Modal from "./Component/Modal";
import PromiseComponent from "./Component/PromiseComponent";

function App() {
  // logged in state, which tracks the state if the user is currently logged in or not
  // initially set to false
  const [loggedIn, setLoggedIn] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(false);

  // basic logout function, removes token and user id from session storage
  const logout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setLoggedIn(false);
    // reloads the window, so we get back to the login form
    window.location.reload();
  };

  const login = (e) => {
    e.preventDefault();
    setRefreshPosts(true);
    setLoggedIn(true);
  };

  const doRefreshPosts = () => {
    console.log("CALLING DOREFRESHPOSTS IN APP.JSX");
    setRefreshPosts(true);
  };

  const toggleModal = (e) => {
    e.preventDefault();
    // Take the current state of openModal, and update it to be the negated value of that
    // ex) if openModal == false, this will update openModal to true
    setOpenModal((prev) => !prev);
    console.log(openModal);
  };

  return (
    // the app is wrapped in a router component, that will render the
    // appropriate content based on the URL path.  Since this is a
    // single page app, it allows some degree of direct linking via the URL
    // rather than by parameters.  Note that the "empty" route "/", uses the HomePage
    // component, if you look in the HomePage component you will see a ternary operation:
    // if the user is logged in, show the "home page", otherwise show the login form.
    <Router basename={process.env.PUBLIC_URL}>
      <div className="App">
        <header className="App-header">
          <Navbar
            toggleModal={(e) => toggleModal(e)}
            logout={(e) => logout(e)}
          />
          <div className="maincontent" id="mainContent">
            <Routes>
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/"
                element={
                  <HomePage
                    setLoggedIn={setLoggedIn}
                    doRefreshPosts={doRefreshPosts}
                    appRefresh={refreshPosts}
                  />
                }
              />
              <Route path="/friends" element={<Friends />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/promise" element={<PromiseComponent />} />
              {/* <Route path="/posts" element={<Posts doRefreshPosts={this.doRefreshPosts} login={this.login} apprefresh={this.state.refreshPosts} />} /> */}
              {/* <Route path="/" element={<Posts doRefreshPosts={this.doRefreshPosts} login={this.login} apprefresh={this.state.refreshPosts} />} /> */}
            </Routes>
          </div>
        </header>

        <Modal show={openModal} onClose={(e) => toggleModal(e)}>
          This is a modal dialog!
        </Modal>
      </div>
    </Router>
  );
}
export default App;

// /*
//   App.js is the starting point for the application.   All of the components in your app should have this file as the root.
//   This is the level that will handle the routing of requests, and also the one that will manage communication between
//   sibling components at a lower level.  It holds the basic structural components of navigation, content, and a modal dialog.
// */

// import React from "react";
// import "./App.css";
// import PostForm from "./Component/PostForm.jsx";
// import FriendList from "./Component/FriendList.jsx";
// import GroupList from "./Component/GroupList.jsx";
// import LoginForm from "./Component/LoginForm.jsx";
// import Profile from "./Component/Profile.jsx";
// import FriendForm from "./Component/FriendForm.jsx";
// import Modal from "./Component/Modal.jsx";
// import Navbar from "./Component/Navbar.jsx";
// import Promise from "./Component/Promise.jsx";

// import {
//   BrowserRouter as Router, Route, Routes
// } from 'react-router-dom';

// // toggleModal will both show and hide the modal dialog, depending on current state.  Note that the
// // contents of the modal dialog are set separately before calling toggle - this is just responsible
// // for showing and hiding the component
// function toggleModal(app) {
//   app.setState({
//     openModal: !app.state.openModal
//   });
// }

// // the App class defines the main rendering method and state information for the app
// class App extends React.Component {

//   // the app holds a few state items : whether or not the modal dialog is open, whether or not we need to refresh
//   // the post list, and whether or not the login or logout actions have been triggered, which will change what the
//   // user can see (many features are only available when you are logged in)
//   constructor(props) {
//     super(props);
//     this.state = {
//       openModal: false,
//       refreshPosts: false,
//       logout: false,
//       login: false
//     };

//     // in the event we need a handle back to the parent from a child component,
//     // we can create a reference to this and pass it down.
//     this.mainContent = React.createRef();

//     // since we are passing the following methods to a child component, we need to
//     // bind them, otherwise the value of "this" will mean the child, and not the app
//     this.doRefreshPosts = this.doRefreshPosts.bind(this);
//     this.login = this.login.bind(this);
//     this.logout = this.logout.bind(this);
//   }

//   // on logout, pull the session token and user from session storage and update state
//   logout = () =>{
//     sessionStorage.removeItem("token");
//     sessionStorage.removeItem("user");
//     this.setState({
//       logout: true,
//       login: false
//     });

//   }

//   // on login, update state and refresh the posts
//   login = () => {
//     this.setState({
//       login: true,
//       logout: false,
//       refreshPosts:true
//     });
//   }

//   // doRefreshPosts is called after the user logs in, to display relevant posts.
//   // there are probably more elegant ways to solve this problem, but this is... a way
//   doRefreshPosts = () => {
//     console.log("CALLING DOREFRESHPOSTS IN APP");
//     this.setState({
//       refreshPosts:true
//     });
//   }

//   componentDidMount(){
//     window.addEventListener('click', e => {console.log("TESTING EVENT LISTENER")});

//   }

//   render() {

//     return (

// the app is wrapped in a router component, that will render the
// appropriate content based on the URL path.  Since this is a
// single page app, it allows some degree of direct linking via the URL
// rather than by parameters.  Note that the "empty" route "/", which has
// the same effect as /posts, needs to go last, because it uses regular
// expressions, and would otherwise capture all the routes.  Ask me how I
// know this.
// <Router basename={process.env.PUBLIC_URL}>
// <div className="App">
//   <header className="App-header">

//     <Navbar toggleModal={e => toggleModal(this, e)} logout={this.logout}/>

//     <div className="maincontent" id="mainContent">
//       <Routes>
//         <Route path="/settings" element={<Settings login={this.login}  />} />
//         <Route path="/friends" element={<Friends  login={this.login} />} />
//         <Route path="/groups" element={<Groups  login={this.login} />} />
//         <Route path="/posts" element={<Posts doRefreshPosts={this.doRefreshPosts} login={this.login} apprefresh={this.state.refreshPosts} />} />
//         <Route path="/promise" element={<Promise />} />
//         <Route path="/" element={<Posts doRefreshPosts={this.doRefreshPosts} login={this.login} apprefresh={this.state.refreshPosts} />} />

//       </Routes>
//     </div>
//   </header>

//   <Modal show={this.state.openModal} onClose={e => toggleModal(this, e)}>
//     This is a modal dialog!
//   </Modal>
// </div>
// </Router>
//     );
//   }
// }

// const Settings = (props) => {
//    // if the user is not logged in, show the login form.  Otherwise, show the post form
//    if (!sessionStorage.getItem("token")){
//     console.log("LOGGED OUT");
//     return(
//       <div>
//       <p>CSE 370 Social Media Test Harness</p>
//       <LoginForm login={props.login}  />
//       </div>
//     );
//   }
//   return (
//   <div className="settings">
//   <p>Settings</p>
//   <Profile userid={sessionStorage.getItem("user")} />
// </div>
//   );
// }

// const Friends = (props) => {
//    // if the user is not logged in, show the login form.  Otherwise, show the post form
//    if (!sessionStorage.getItem("token")){
//     console.log("LOGGED OUT");
//     return(
//       <div>
//       <p>CSE 370 Social Media Test Harness</p>
//       <LoginForm login={props.login}  />
//       </div>
//     );
//   }
//  return (
//   <div>
//     <p>Friends</p>
//       <FriendForm userid={sessionStorage.getItem("user")} />
//       <FriendList userid={sessionStorage.getItem("user")} />
//   </div>
//    );
// }

// const Groups = (props) => {
//   // if the user is not logged in, show the login form.  Otherwise, show the post form
//   if (!sessionStorage.getItem("token")){
//    console.log("LOGGED OUT");
//    return(
//      <div>
//      <p>CSE 370 Social Media Test Harness</p>
//      <LoginForm login={props.login}  />
//      </div>
//    );
//  }
//   return (
//  <div>
//    <p>Join a Group!</p>
//      <GroupList userid={sessionStorage.getItem("user")} />
//  </div>
//   );
// }

// const Posts = (props) => {
//   console.log("RENDERING POSTS");
//   console.log(typeof(props.doRefreshPosts));

//   console.log ("TEST COMPLETE");

//   // if the user is not logged in, show the login form.  Otherwise, show the post form
//   if (!sessionStorage.getItem("token")){
//     console.log("LOGGED OUT");
//     return(
//       <div>
//       <p>CSE 370 Social Media Test Harness</p>
//       <LoginForm login={props.login}  />
//       </div>
//     );
//   }else{
//     console.log("LOGGED IN");
//     return (
//       <div>
//       <p>CSE 370 Social Media Test Harness</p>
//       <PostForm refresh={props.apprefresh}/>
//     </div>
//     );
//   }
// }

// // export the app for use in index.js
// export default App;