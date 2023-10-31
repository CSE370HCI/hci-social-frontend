import React, { useState } from "react";

const PostForm = ({ refresh, loadPosts }) => {
  const [postText, setPostText] = useState("");
  const [postMessage, setPostMessage] = useState("");

  // the handler for submitting a new post. This will call the API to create a new post.
  // while the test harness does not use images, if you had an image URL you would pass it
  // in the attributes field. Posts also does double duty as a message; if you want in-app messaging
  // you would add a recipientUserID for a direct message, or a recipientGroupID for a group chat message.
  // if the post is a comment on another post (or comment) you would pass in a parentID of the thing
  // being commented on. Attributes is an open ended name/value segment that you can use to add
  // whatever custom tuning you need, like category, type, rating, etc.
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
      }),
    })
      .then((res) => res.json())
      .then(
        (result) => {
          setPostMessage(result.Status);
          loadPosts()
          alert("Post was successful");
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
          Post Something!
          <br />
          <textarea
            rows="10"
            cols="70"
            onChange={(e) => setPostText(e.target.value)} // e.target.value gets the value that the user inputs
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

export default PostForm;