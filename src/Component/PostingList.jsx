import React, { useState, useEffect, useRef } from "react";
import Post from "./Post.jsx";

/*
  The PostingList is going to load all the posts in the system. This model won't work well if you have a lot of 
  posts - you would want to find a way to limit the posts shown.
*/
const PostingList = ({ refresh, posts, error, isLoaded, type, loadPosts }) => {
  if (!sessionStorage.getItem("token")) {
    return <div>Please Log In...</div>;
  } else if (error) {
    return <div>Error: {error.message}</div>;
  } else if (!isLoaded) {
    return <div>Loading...</div>;
  } else if (posts.length > 0) {
    return (
      <div className="posts">
        {posts.map((post) => (
          <Post key={post.id} post={post} type={type} loadPosts={loadPosts} />
        ))}
      </div>
    );
  } else {
    return <div>No Posts Found</div>;
  }
};

export default PostingList;
