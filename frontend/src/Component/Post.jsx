import React from "react";
import "../App.css";
import CommentForm from "./CommentForm.jsx";
import helpIcon from "../assets/delete.png";
import commentIcon from "../assets/comment.svg";

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      comments: this.props.post.commentCount
    };
    this.post = React.createRef();

  }

  showModal = e => {
    this.setState({
      showModal: !this.state.showModal
    });
  };

  setCommentCount = newcount => {
    this.setState({
      comments: newcount
    });
  };

  getCommentCount() {
    if (!this.state.comments || this.state.comments === "0") {
      return 0;
    }
    return parseInt(this.state.comments);
  }

  showHideComments() {
    if (this.state.showModal) {
      return "comments show";
    }
    return "comments hide";
  }

  deletePost(postID) {
    //make the api call to post
    fetch(process.env.REACT_APP_API_PATH+"/posts/"+postID, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      }
      })
      .then(
        result => {
          this.props.loadPosts();
        },
        error => {
          alert("error!"+error);
        }
      );
  }


  // we only want to display comment information if this is a post that accepts comments
  conditionalDisplay() {
    console.log("Comment count is " + this.props.post.commentCount);

    //if (this.props.post.commentCount <= 0) {
    //  return "";
    //  }

    //else {
      return (
        <div className="comment-block">

          <div className="comment-indicator">
            <div className="comment-indicator-text">
              {this.getCommentCount()} Comments
            </div>
            <img
              src={commentIcon}
              className="comment-icon"
              onClick={e => this.showModal()}
              alt="View Comments"
            />
          </div>
          <div className={this.showHideComments()}>
            <CommentForm
              onAddComment={this.setCommentCount}
              parent={this.props.post.id}
              commentCount={this.getCommentCount()}
            />
          </div>
        </div>
      );
    //}

  }

  // we only want to expose the delete post functionality if the user is
  // author of the post
  showDelete(){
    if (this.props.post.author.id == sessionStorage.getItem("user")) {
      return(
      <img
        src={helpIcon}
        className="sidenav-icon deleteIcon"
        alt="Delete Post"
        title="Delete Post"
        onClick={e => this.deletePost(this.props.post.id)}
      />
    );
    }
    return "";
  }

  render() {

    return (
      <div>

      <div
        key={this.props.post.id}
        className={[this.props.type, "postbody"].join(" ")}
      >
      <div className="deletePost">
      {this.props.post.author.username} ({this.props.post.createdAt})
      {this.showDelete()}
      </div>
         <br />{" "}
        {this.props.post.content}
        {this.conditionalDisplay()}
      </div>
      </div>
    );
  }
}
