import React, { useState, useEffect } from "react";
import "../App.css";
import CommentForm from "./CommentForm.jsx";
import helpIcon from "../assets/delete.png";
import commentIcon from "../assets/comment.svg";
import likeIcon from "../assets/thumbsup.png";

/* This will render a single post, with all of the options like comments, delete, tags, etc. 
  
    This component takes in a post, a type, and a loadPosts props
    post: the current post to load/display
    type: - postlist if the post itself is the main post (doesn't have a parentId)
          - commentlist if the post is a comment on another post/comment (has a parentId)
    loadPosts: a function passed into the component which is used to load the posts/comments 
              depending on if it is a comment or an original post
*/
const Post = ({ post, type, loadPosts }) => {
  const [showModal, setShowModal] = useState(false);
  const [showTags, setShowTags] = useState(post.reactions.length > 0);
  const [comments, setComments] = useState(parseInt(post._count.children));
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [postComments, setPostComments] = useState([]);

  const tagPost = (tag, thisPostID) => {
    //find the appropriate reaction to delete - namely, the one from the current user
    let userReaction = -1;
    post.reactions.forEach((reaction) => {
      if (reaction.reactorID === parseInt(sessionStorage.getItem("user"))) {
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

  // function used to update the classname of the comments on a post
  // if the showModal state is true, show the comments, otherwise hide the comments
  const showHideComments = () => {
    return showModal ? "comments show" : "comments hide";
  };

  // function used to update the classname of the tags on a post
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


  // Function used to delete a post given a postID in the parameter
  // if the post successfully is deleted, call lostPosts to reload the posts
  // to show all the posts without the deleted post
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

  // function used to load the comments of a post given the post id from the props
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
            setComments(result[0].length);
          }
        })
        .catch((err) => {
          setIsLoaded(true);
          setError(err);
          console.log("ERROR loading posts");
        });
    }
  };

  // load the comments of the specific post clicked on
  // loadComments will run when showModal get turned to true when the user clicks on the comment icon
  useEffect(() => {
    loadComments();
  }, [showModal]);

  // Function to handle the display of comments and related functionality
  const commentDisplay = () => {
    return (
      <div className="comment-block">
        {/* Tag button */}
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
        {/* Display the number of reactions for a given post */}
        <p>({post.reactions.length})</p>
         {/* Comment indicator and icon */}
        <div className="comment-indicator">
          <div className="comment-indicator-text">{comments} Comments</div>
          <img
            src={commentIcon}
            className="comment-icon"
            onClick={(e) => {
              // Toggle the showModal state to show/hide comments
              setShowModal((prev) => !prev);
            }}
            alt="View Comments"
          />
        </div>
        {/* Display the comments and CommentForm component */}
        <div className={showHideComments()}>
          <CommentForm
            parent={post.id}
            loadPosts={loadPosts}
            loadComments={loadComments}
          />

          {/* Display existing comments using the same Post component recursively */}
          <div className="posts">
            <div>
              {/* Check if there are comments before mapping through them */}
              {postComments.length > 0 &&
                postComments.map((comment) => (
                  <Post
                    key={comment.id}
                    post={comment} // pass in the comment as the post to recursively get all the comments (comments of a comment)
                    type="commentlist" // Indicate that this is a comment of a post
                    loadPosts={loadComments} // Function to reload comments for this post
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to display the delete icon if the user is the author of post
  const showDelete = () => {
    if (post.authorID === parseInt(sessionStorage.getItem("user"))) {
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

  // Render the main post body with author information, delete icon (if applicable),
  // post content, and the comment display section including tags, reactions, and comments.
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
