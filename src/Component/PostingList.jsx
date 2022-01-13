import React from "react";
import Post from "./Post.jsx";

export default class PostingList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      posts: [],
      listType: props.listType
    };
    this.postingList = React.createRef();
    this.loadPosts = this.loadPosts.bind(this);
  }

  componentDidMount() {

    this.loadPosts();

  }

  componentDidUpdate(prevProps) {
    console.log("PrevProps "+prevProps.refresh);
    console.log("Props "+this.props.refresh);
    if (prevProps.refresh !== this.props.refresh){
      this.loadPosts();
    }
  }

  loadPosts() {
    let url = process.env.REACT_APP_API_PATH+"/posts?parentID=";
    if (this.props && this.props.parentid){
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

      if (posts.length > 0){
      return (

        <div className="posts">

          {posts.map(post => (
            <Post key={post.id} post={post} type={this.props.type} loadPosts={this.loadPosts}/>
          ))}

        </div>

      );
    }else{
      return (<div> No Posts Found </div>);
    }
    } else {
      return <div> Please Log In... </div>;
    }
  }
}
