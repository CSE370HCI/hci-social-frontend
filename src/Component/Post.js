import React from "react";
import "../App.css";
import CommentForm from "./CommentForm.js";

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      comments: this.props.post.comment_flag
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

  conditionalDisplay() {
    console.log("Parent is " + this.props.post.parent_id);
    if (this.props.post.parent_id) {
      return "";
    } else {
      return (
        <div className="comment-block">
          <div className="comment-indicator">
            <div className="comment-indicator-text">
              {this.getCommentCount()} Comments
            </div>
            <img
              src={require("../comment.svg")}
              className="comment-icon"
              onClick={e => this.showModal()}
              alt="View Comments"
            />
          </div>
          <div className={this.showHideComments()}>
            <CommentForm
              onAddComment={this.setCommentCount}
              parent={this.props.post.post_id}
              commentCount={this.getCommentCount()}
            />
          </div>
        </div>
      );
    }
  }

  render() {
    return (
      <div
        key={this.props.post.post_id}
        className={[this.props.type, "postbody"].join(" ")}
      >
        {this.props.post.name} {this.props.post.timestamp} <br />{" "}
        {this.props.post.post_text}
        {this.conditionalDisplay()}
      </div>
    );
  }
}
