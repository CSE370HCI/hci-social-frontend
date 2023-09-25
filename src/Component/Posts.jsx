import React from 'react'
import PostForm from './PostForm'

const Posts = ({ doRefreshPosts, appRefresh }) => {
  return (
    <div>
       <p>CSE 370 Social Media Test Harness</p>
       <PostForm refresh={appRefresh} />
    </div>
  )
}

export default Posts