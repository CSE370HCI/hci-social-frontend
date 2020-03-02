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
  }

  submitHandler = event => {
    //keep the form from actually submitting
    event.preventDefault();

    //make the api call to the authentication page
    fetch("http://stark.cse.buffalo.edu/hci/postcontroller.php", {
      method: "post",
      body: JSON.stringify({
        action: "addOrEditPosts",
        user_id: sessionStorage.getItem("user"),
        session_token: sessionStorage.getItem("token"),
        posttext: this.state.post_text
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
        <PostingList ref={this.postListing} type="postlist" />
      </div>
    );
  }
}
