import React, { useState, useEffect } from "react";

const CommentForm = ({
  onAddComment,
  parent,
  commentCount,
  loadPosts,
  loadComments,
}) => {
  const [postText, setPostText] = useState("");
  const [postMessage, setPostMessage] = useState("");

  const submitHandler = (event) => {
    event.preventDefault();

    fetch(process.env.REACT_APP_API_PATH + "/posts", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
      body: JSON.stringify({
        authorID: sessionStorage.getItem("user"),
        content: postText,
        parentID: parent,
        thumbnailURL: "",
        type: "post",
      }),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          onAddComment(commentCount + 1);
          setPostMessage(result.Status);
          loadPosts();
          loadComments();
        },
        (error) => {
          alert("error!");
        }
      );
  };

  return (
    <div>
      <form onSubmit={submitHandler}>
        <label>
          Add A Comment to Post {parent}
          <br />
          <textarea
            rows="10"
            cols="70"
            onChange={(e) => setPostText(e.target.value)}
          />
        </label>
        <br />

        <input type="submit" value="submit" />
        <br />
        {postMessage}
      </form>
    </div>
  );
};

export default CommentForm;
