import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import Posts from "./Posts";

function useToken(){
  const [userToken, setUserToken] = useState("");

  // useEffect hook, this will run everything inside the callback
  // function once when the component loads
  useEffect(() => {
    setUserToken(sessionStorage.getItem("token"));
  }, []);

  return userToken
}

const HomePage = ({ isLoggedIn, setLoggedIn, doRefreshPosts, appRefresh }) => {
  // state variable for userToken, intiially set to an empty string
  // if the user is not logged in, show the login form.  Otherwise, show the post form
  let userToken = useToken()

  return (
    <div>
      {!userToken ? (
        <>
          <LoginForm setLoggedIn={setLoggedIn} />
        </>
      ) : (
        <Posts doRefreshPosts={doRefreshPosts} appRefresh={appRefresh} />
      )}
    </div>
  );
};

export default HomePage;
