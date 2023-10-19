import React, { useEffect, useState } from "react";
import PostForm from "./PostForm";
import PostingList from "./PostingList";

const Posts = ({ doRefreshPosts, appRefresh }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadPosts = () => {
    if (sessionStorage.getItem("token")) {
      let url = process.env.REACT_APP_API_PATH + "/posts?parentID=";

      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      })
        .then((res) => res.json())
        .then((result) => {
          if (result) {
            setIsLoaded(true);
            setPosts(result[0]);
            console.log("Got Posts");
          }
        })
        .catch((err) => {
          setIsLoaded(true);
          setError(err);
          console.log("ERROR loading posts");
        });
    }
  };

  useEffect(() => {
    // the first thing we do when the component is ready is load the posts.
    loadPosts();
  }, []);

  return (
    <div>
      <p>CSE 370 Social Media Test Harness</p>
      <PostForm refresh={appRefresh} loadPosts={loadPosts} />
      <PostingList
        refresh={appRefresh}
        posts={posts}
        error={error}
        isLoaded={isLoaded}
        type="postlist"
        loadPosts={loadPosts}
      />
    </div>
  );
};

export default Posts;
