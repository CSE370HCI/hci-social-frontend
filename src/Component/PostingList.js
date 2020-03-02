import React from "react";
import Post from "./Post.js";

export default class PostingList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      posts: [],
      listType: props.listType
    };
  }

  componentDidMount() {
    this.loadPosts();
  }

  loadPosts() {
    fetch("http://stark.cse.buffalo.edu/hci/postcontroller.php", {
      method: "post",
      body: JSON.stringify({
        action: "getPosts",
        max_posts: "10",
        parentid: this.props.parentid
      })
    })
      .then(res => res.json())
      .then(
        result => {
          if (result.posts) {
            this.setState({
              isLoaded: true,

              posts: result.posts
            });
          }
        },
        error => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      );
  }

  render() {
    //this.loadPosts();
    const {error, isLoaded, posts} = this.state;
    if (error) {
      return <div> Error: {error.message} </div>;
    } else if (!isLoaded) {
      return <div> Loading... </div>;
    } else {
      return (
        <div className="posts">
          {posts.map(post => (
            <Post key={post.post_id} post={post} type={this.props.type} />
          ))}
        </div>
      );
    }
  }
}
