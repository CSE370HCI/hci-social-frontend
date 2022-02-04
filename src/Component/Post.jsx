import React from "react";
import "../App.css";
import CommentForm from "./CommentForm.jsx";
import helpIcon from "../assets/delete.png";
import commentIcon from "../assets/comment.svg";
import likeIcon from "../assets/thumbsup.png";

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      comments: this.props.post.commentCount,
      showTags: this.props.post.reactions.length > 0
    };
    this.post = React.createRef();
  }

  showModal = e => {
    this.setState({
      showModal: !this.state.showModal
    });
  };

  showTags = e => {
    this.setState({
      showTags: !this.state.showTags
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

  tagPost(tag, thisPostID){
     if (this.props.post.reactions.length > 0){
      //make the api call to post
      fetch(process.env.REACT_APP_API_PATH+"/post-reactions/"+this.props.post.reactions[0].id, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+sessionStorage.getItem("token")
        },
      })
        .then(
          result => {
            this.props.loadPosts();
          },
          error => {
            alert("error!"+error);
          }
        );
     }else{
     //make the api call to post
     fetch(process.env.REACT_APP_API_PATH+"/post-reactions", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        reactorID: sessionStorage.getItem("user"),
        postID: thisPostID,
        name: "like"
      })
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
  }

  // this will toggle the CSS classnames that will either show or hide the comment block
  showHideComments() {
    if (this.state.showModal) {
      return "comments show";
    }
    return "comments hide";
  }

  // this will toggle the CSS classnames that will either show or hide the comment block
  showHideTags() {
    if (this.state.showTags) {
      if (this.props.post.reactions.length > 0){
        console.log("Had a reaaction");
        return "tags show tag-active"
      }
      return "tags show";
    }
    return "tags hide";
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


  commentDisplay() {
    console.log("Comment count is " + this.props.post.commentCount);

    //if (this.props.post.commentCount <= 0) {
    //  return "";
    //  }

    //else {
      return (
        <div className="comment-block">
          <div className="tag-block">
            <button value="tag post" onClick={e => this.showTags()}>
            tag post
            </button>
          </div>
          <div name="tagDiv" className={this.showHideTags()}>
          <img
              src={likeIcon}
              className="comment-icon"
              onClick={e => this.tagPost("like",this.props.post.id)}
              alt="Like Post"
            />
          </div>
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
    if (this.props.post.author.id === sessionStorage.getItem("user")) {
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
      {this.props.post.author.attributes.username} ({this.props.post.created})
      {this.showDelete()}
      </div>
         <br />{" "}
        {this.props.post.content}
        {this.commentDisplay()}
      </div>
      </div>
    );
  }
}
