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
    let url = "http://localhost:3001/api/posts?parentID=";
    if (this.props.parentid){
      url += this.props.parentid;
    }
    fetch(url, {
      method: "get",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+sessionStorage.getItem("token")
      },

    })
      .then(res => res.json())
      .then(
        result => {
          if (result) {
            this.setState({
              isLoaded: true,
              posts: result[0]
            });
            console.log("Got Posts");
          }
        },
        error => {
          this.setState({
            isLoaded: true,
            error
          });
          console.log("ERROR loading Posts")
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
    } else if (posts) {

      return (

        <div className="posts">

          {posts.map(post => (
            <Post key={post.post_id} post={post} type={this.props.type} />
          ))}

        </div>

      );
    } else {
      return <div> Please Log In... </div>;
    }
  }
}
