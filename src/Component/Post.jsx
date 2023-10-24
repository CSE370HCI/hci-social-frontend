import React, { useState, useEffect } from "react";
import "../App.css";
import CommentForm from "./CommentForm.jsx";
import helpIcon from "../assets/delete.png";
import commentIcon from "../assets/comment.svg";
import likeIcon from "../assets/thumbsup.png";

const Post = ({ post, type, loadPosts }) => {
  const [showModal, setShowModal] = useState(false);
  const [showTags, setShowTags] = useState(post.reactions.length > 0);
  const [comments, setComments] = useState(post._count.children);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [postComments, setPostComments] = useState([]);

  const setCommentCount = (newcount) => {
    setComments(newcount);
  };

  const getCommentCount = () => {
    if (!comments || comments === "0") {
      return 0;
    }
    return parseInt(comments);
  };

  const tagPost = (tag, thisPostID) => {
    //find the appropriate reaction to delete - namely, the one from the current user
    let userReaction = -1;
    post.reactions.forEach((reaction) => {
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
          loadPosts();
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
          loadPosts();
        },
        (error) => {
          alert("error!" + error);
        }
      );
    }
  };

  const showHideComments = () => {
    return showModal ? "comments show" : "comments hide";
  };

  const showHideTags = () => {
    if (showTags) {
      if (post.reactions.length > 0) {
        for (let i = 0; i < post.reactions.length; i++) {
          if (post.reactions[i].reactorID === sessionStorage.getItem("user")) {
            return "tags show tag-active";
          }
        }
      }
      return "tags show";
    }
    return "tags hide";
  };

  const deletePost = (postID) => {
    fetch(process.env.REACT_APP_API_PATH + "/posts/" + postID, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    })
      .then((result) => {
        loadPosts();
      })
      .catch((error) => {
        alert("error!" + error);
      });
  };

  const loadComments = () => {
    if (sessionStorage.getItem("token")) {
      let url = process.env.REACT_APP_API_PATH + "/posts?parentID=" + post.id;

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
            setPostComments(result[0]);
            console.log(result[0]);
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
    loadComments();
  }, [showModal]);

  const commentDisplay = () => {
    return (
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
            onClick={(e) => tagPost("like", post.id)}
            alt="Like Post"
          />
        </div>
        <p>({post.reactions.length})</p>
        <div className="comment-indicator">
          <div className="comment-indicator-text">
            {getCommentCount()} Comments
          </div>
          <img
            src={commentIcon}
            className="comment-icon"
            onClick={(e) => {
              setShowModal((prev) => !prev);
            }}
            alt="View Comments"
          />
        </div>
        <div className={showHideComments()}>
          <CommentForm
            onAddComment={setCommentCount}
            parent={post.id}
            commentCount={getCommentCount}
            loadPosts={loadPosts}
            loadComments={loadComments}
          />

          <div className="posts">
            <div>
              {postComments.length > 0 &&
                postComments.map((comment) => (
                  <Post
                    key={comment.id}
                    post={comment}
                    type="commentlist"
                    loadPosts={loadComments}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const showDelete = () => {
    if (post.authorId === sessionStorage.getItem("user")) {
      return (
        <img
          src={helpIcon}
          className="sidenav-icon deleteIcon"
          alt="Delete Post"
          title="Delete Post"
          onClick={() => deletePost(post.id)}
        />
      );
    }
    return null;
  };

  return (
    <div key={post.id} className={[type, "postbody"].join(" ")}>
      <div className="deletePost">
        {post.author.attributes.username} ({post.created}){showDelete()}
      </div>
      <br /> {post.content}
      {commentDisplay()}
    </div>
  );
};

export default Post;
