import React from "react";
import "../App.css";
import PostingList from "./PostingList.js";

export default class PostForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      post_text: "",
      postmessage: ""
    };
    this.postListing = React.createRef();
console.log("Postform Props "+this.props.refresh);
  }

  
  submitHandler = event => {
    //keep the form from actually submitting
    event.preventDefault();

    //make the api call to post
    fetch("http://localhost:3001/api/posts", {
      method: "post",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },
      body: JSON.stringify({
        authorID: sessionStorage.getItem("user"),
        content: this.state.post_text,
        thumbnailURL: "",
        type: "post"
      })
    })
      .then(res => res.json())
      .then(
        result => {
          this.setState({
            postmessage: result.Status
          });
          this.postListing.current.loadPosts();
        },
        error => {
          alert("error!");
        }
      );
  };

  myChangeHandler = event => {
    this.setState({
      post_text: event.target.value
    });
  };

  render() {
    return (
      <div>
        <form onSubmit={this.submitHandler}>
          <label>
            Post Something!
            <br />
            <textarea rows="10" cols="70" onChange={this.myChangeHandler} />
          </label>
          <br />

          <input type="submit" value="submit" />
          <br />
          {this.state.postmessage}
        </form>
        <PostingList ref={this.postListing} refresh={this.props.refresh} type="postlist" />
      </div>
    );
  }
}
