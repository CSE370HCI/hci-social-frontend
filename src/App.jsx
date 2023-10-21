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