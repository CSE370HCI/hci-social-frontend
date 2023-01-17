import React from "react";
import Post from "./Post.jsx";

/* The PostingList is going to load all the posts in the system.  This model won't work well if you have a lot of 
  posts - you would want to find a way to limit the posts shown. */

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

  // the first thing we do when the component is ready is load the posts.  This updates the props, which will render the posts  
  componentDidMount() {
    this.loadPosts();
  }

  // if a parent component wants us to refresh, they can update the refresh value in the props passed in; this should also trigger a 
  // reload of the posting list
  componentDidUpdate(prevProps) {
    //console.log("PrevProps "+prevProps.refresh);
    //console.log("Props "+this.props.refresh);
    if (prevProps.refresh !== this.props.refresh){
      this.loadPosts();
    }
  }

  loadPosts() {
    // if the user is not logged in, we don't want to try loading posts, because it will just error out.  
    if (sessionStorage.getItem("token")){
    let url = process.env.REACT_APP_API_PATH+"/posts?parentID=";
    
    // if there is a parentid passed in, then we are trying to get all the comments for a particular post or comment, so
    // we will restrict the fetch accordingly.
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
  }

  render() {
    
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
