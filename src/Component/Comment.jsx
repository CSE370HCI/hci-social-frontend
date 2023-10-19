import React, { useEffect, useState } from "react";
import helpIcon from "../assets/delete.png";
import likeIcon from "../assets/thumbsup.png";

const Comment = ({ comment, loadComments }) => {
  const [showTags, setShowTags] = useState(comment.reactions.length > 0);

  const deletePost = () => {
    //make the api call to delete
    fetch(process.env.REACT_APP_API_PATH + "/posts/" + comment.id, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    }).then(
      (result) => {
        loadComments();
      },
      (error) => {
        alert("error!" + error);
      }
    );
  };

  // we only want to expose the delete post functionality if the user is
  // author of the post
  const showDelete = () => {
    if (comment.author.id === sessionStorage.getItem("user")) {
      return (
        <img
          src={helpIcon}
          className="sidenav-icon deleteIcon"
          alt="Delete Post"
          title="Delete Post"
          onClick={(e) => deletePost(comment.id)}
        />
      );
    }
  };

  const tagPost = (tag, thisPostID) => {
    //find the appropriate reaction to delete - namely, the one from the current user
    let userReaction = -1;
    comment.reactions.forEach((reaction) => {
      if (reaction.reactorID === sessionStorage.getItem("user")) {
        userReaction = reaction.id;
      }
    });

    // if there is one, delete it.
    if (userReaction >= 0) {
      //make the api call to post
      fetch(
        process.env.REACT_APP_API_PATH + "/post-reactions/" + userReaction,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      ).then(
        (result) => {
          loadComments();
        },
        (error) => {
          alert("error!" + error);
        }
      );
    } else {
      //make the api call to post
      fetch(process.env.REACT_APP_API_PATH + "/post-reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
        body: JSON.stringify({
          reactorID: sessionStorage.getItem("user"),
          postID: thisPostID,
          name: "like",
        }),
      }).then(
        (result) => {
          loadComments();
        },
        (error) => {
          alert("error!" + error);
        }
      );
    }
  };

  const showHideTags = () => {
    if (showTags) {
      if (comment.reactions.length > 0) {
        for (let i = 0; i < comment.reactions.length; i++) {
          if (
            comment.reactions[i].reactorID === sessionStorage.getItem("user")
          ) {
            return "tags show tag-active";
          }
        }
      }
      return "tags show";
    }
    return "tags hide";
  };

  return (
    <div className="commentlist postbody">
      <div>
        <div className="deletePost">
          {comment.author.attributes.username} ({comment.created}){showDelete()}
        </div>
        <br /> {comment.content}
        <div className="comment-block">
          <div className="tag-block">
            <button
              value="tag post"
              onClick={(e) => setShowTags((prev) => !prev)}
            >
              tag post
            </button>
          </div>
          <div name="tagDiv" className={showHideTags()}>
            <img
              src={likeIcon}
              className="comment-icon"
              onClick={(e) => tagPost("like", comment.id)}
              alt="Like Post"
            />
          </div>
          <p>({comment.reactions.length})</p>
        </div>
      </div>
    </div>
  );
};

export default Comment;
