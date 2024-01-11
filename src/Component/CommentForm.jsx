import React, { useState } from "react";

// CommentForm is a functional component that takes parent, loadPosts, and loadComments as props
const CommentForm = ({
  parent, // ID of the parent post to which the comment belongs
  loadPosts, // Function to reload posts
  loadComments, // Function to reload comments
}) => {
  // useState to manage the post text
  const [postText, setPostText] = useState("");
  // useState to manage the status message after posting
  const [postMessage, setPostMessage] = useState("");

  // Function to handle form submission by making a POST request
  // to the server to add the comment to a post with a given parentID
  // which is passed in from props
  const submitHandler = (event) => {
    // Keep the form from actually submitting
    event.preventDefault();

    // submit the comment as a post, with the parentID being the parent that is passed
    // in through props in Post.jsx
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
          setPostMessage(result.Status);
          loadPosts();
          loadComments();
          setPostText("");
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
