<?php

//testing
require 'utils.php';
require 'connect.php';

// the response will be a JSON object
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");$json = array();
// pull the input, which should be in the form of a JSON object
$json_params = file_get_contents('php://input');
// check to make sure that the JSON is in a valid format
if (isValidJSON($json_params)) {
    //load in all the potential parameters.  These should match the database columns for the objects.
    $conn = getDbConnection();
    $decoded_params = json_decode($json_params, true);
    $action = $decoded_params['action'];
    $json['action'] = $action;
    // uncomment the following line if you want to turn PHP error reporting on for debug - note, this will break the JSON response
    //ini_set('display_errors', 1); error_reporting(-1);
    $postId = "";
    if (array_key_exists('postid', $decoded_params)) {
        $postId =  $decoded_params['postid'];
    }
    $userId = "";
    if (array_key_exists('userid', $decoded_params)) {
        $userId =  $decoded_params['userid'];
    }
    $postType = "";
    if (array_key_exists('posttype', $decoded_params)) {
        $postType =  $decoded_params['posttype'];
    }
    $timestamp = "";
    if (array_key_exists('timestamp', $decoded_params)) {
        $timestamp =  $decoded_params['timestamp'];
    }
    $postText = "";
    if (array_key_exists('posttext', $decoded_params)) {
        $postText =  $decoded_params['posttext'];
    }
    $postPicUrl = "";
    if (array_key_exists('postpicurl', $decoded_params)) {
        $postPicUrl =  $decoded_params['postpicurl'];
    }
    $commentFlag = "";
    if (array_key_exists('commentflag', $decoded_params)) {
        $commentFlag =  $decoded_params['commentflag'];
    }
    $parentId = "NULL";
    if (array_key_exists('parentid', $decoded_params)) {
        $parentId =  $decoded_params['parentid'];
    }
    $authUserId = "";
    if (array_key_exists('user_id', $decoded_params)) {
        $authUserId =  $decoded_params['user_id'];
    }
    $sessionToken = "";
    if (array_key_exists('session_token', $decoded_params)) {
        $sessionToken =  $decoded_params['session_token'];
    }
    $maxPosts = "";
    if (array_key_exists('max_posts', $decoded_params)) {
        $maxPosts =  $decoded_params['max_posts'];
    }
    $tag = "";
    if (array_key_exists('tag', $decoded_params)) {
        $tag =  $decoded_params['tag'];
    }
    $tagType = "";
    if (array_key_exists('tag_type', $decoded_params)) {
        $tagType =  $decoded_params['tag_type'];
    }
    $offset = "";
    if (array_key_exists('offset', $decoded_params)) {
        $offset =  $decoded_params['offset'];
    }
    $showUserPosts = "false";
    if (array_key_exists('showuserposts', $decoded_params)) {
        $showUserPosts =  $decoded_params['showuserposts'];
    }
    if ($action == "addOrEditPosts") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $args = array();
            if (IsNullOrEmpty($postId)) {
                $sql = "INSERT INTO posts (post_id,user_id,post_type,post_text,post_pic_url,comment_flag,parent_id) VALUES ( ?,?,?,?,?,?,?);";
                array_push($args, $postId);
                array_push($args, $userId);
                array_push($args, $postType);
                array_push($args, $postText);
                array_push($args, $postPicUrl);
                array_push($args, $commentFlag);
                array_push($args, $parentId);
                try {
                    $statement = $conn->prepare($sql);
                    $statement->execute($args);
                    $last_id = $conn->lastInsertId();
                    $json['Record Id'] = $last_id;
                    $json['Status'] = "SUCCESS - Inserted Id $last_id";


                    // if the parentId is not null, then this is a comment.  We need to also update the comment count of the parent
                    if ($parentId != "NULL") {
                        $parentArgs = array();
                        $parentSql = "UPDATE posts SET comment_flag = comment_flag + 1 where post_id = ?";
                        array_push($parentArgs, $parentId);
                        $statement2 = $conn->prepare($parentSql);
                        $statement2->execute($parentArgs);
                    }
                } catch (Exception $e) {
                    $json['Exception'] =  $e->getMessage();
                }
            } else {
                $sql = "UPDATE posts SET user_id = ?,post_type = ?,timestamp = ?,post_text = ?,post_pic_url = ?,comment_flag = ?,parent_id = ? WHERE post_id = ?; ";
                array_push($args, $userId);
                array_push($args, $postType);
                array_push($args, $timestamp);
                array_push($args, $postText);
                array_push($args, $postPicUrl);
                array_push($args, $commentFlag);
                array_push($args, $parentId);
                array_push($args, $postId);
                try {
                    $statement = $conn->prepare($sql);
                    $statement->execute($args);
                    $count = $statement->rowCount();
                    if ($count > 0) {
                        $json['Status'] = "SUCCESS - Updated $count Rows";
                    } else {
                        $json['Status'] = "ERROR - Updated 0 Rows - Check for Valid Ids ";
                    }
                } catch (Exception $e) {
                    $json['Exception'] =  $e->getMessage();
                }
                $json['Action'] = $action;
            }
        } else {
            $json['Status'] = "ERROR - API Key Check Failed";
        }
    } elseif ($action == "deletePosts") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $sql = "DELETE FROM posts WHERE post_id = ?";
            $args = array();
            array_push($args, $postId);
            if (!IsNullOrEmpty($postId)) {
                try {
                    $statement = $conn->prepare($sql);
                    $statement->execute($args);
                    $count = $statement->rowCount();
                    if ($count > 0) {
                        $json['Status'] = "SUCCESS - Deleted $count Rows";
                    } else {
                        $json['Status'] = "ERROR - Deleted 0 Rows - Check for Valid Ids ";
                    }
                } catch (Exception $e) {
                    $json['Exception'] =  $e->getMessage();
                }
            } else {
                $json['Status'] = "ERROR - Id is required";
            }
            $json['Action'] = $action;
        } else {
            $json['Status'] = "ERROR - API Key Check Failed";
        }
    } elseif ($action == "getPosts") {
        $args = array();
        $sql = "SELECT posts.*, users.name FROM posts, users where posts.user_id = users.user_id ";
        $first = false;
        if (!IsNullOrEmpty($postId)) {
            if ($first) {
                $sql .= " WHERE post_id = ? ";
                $first = false;
            } else {
                $sql .= " AND post_id = ? ";
            }
            array_push($args, $postId);
        }
        if (!IsNullOrEmpty($userId)) {
            if ($first) {
                $sql .= " WHERE posts.user_id = ? ";
                $first = false;
            } else {
                $sql .= " AND posts.user_id = ? ";
            }
            array_push($args, $userId);
        }
        if (!IsNullOrEmpty($postType)) {
            if ($first) {
                $sql .= " WHERE post_type = ? ";
                $first = false;
            } else {
                $sql .= " AND post_type = ? ";
            }
            array_push($args, $postType);
        }
        if (!IsNullOrEmpty($timestamp)) {
            if ($first) {
                $sql .= " WHERE timestamp > date( ? )";
                $first = false;
            } else {
                $sql .= " AND timestamp > date( ? ) ";
            }
            array_push($args, $timestamp);
        }
        if (!IsNullOrEmpty($postText)) {
            if ($first) {
                $sql .= " WHERE post_text = ? ";
                $first = false;
            } else {
                $sql .= " AND post_text = ? ";
            }
            array_push($args, $postText);
        }
        if (!IsNullOrEmpty($postPicUrl)) {
            if ($first) {
                $sql .= " WHERE post_pic_url = ? ";
                $first = false;
            } else {
                $sql .= " AND post_pic_url = ? ";
            }
            array_push($args, $postPicUrl);
        }
        if (!IsNullOrEmpty($commentFlag)) {
            if ($first) {
                $sql .= " WHERE comment_flag = ? ";
                $first = false;
            } else {
                $sql .= " AND comment_flag = ? ";
            }
            array_push($args, $commentFlag);
        }
        if (!IsNullOrEmpty($parentId) && $parentId != "NULL") {
            if ($first) {
                $sql .= " WHERE parent_id = ? ";
                $first = false;
            } else {
                $sql .= " AND parent_id = ? ";
            }
            array_push($args, $parentId);
        } else {
            if ($first) {
                $sql .= " WHERE (parent_id is null or parent_id =  0)  ";
                $first = false;
            } else {
                $sql .= " AND (parent_id is null or parent_id =  0) ";
            }
        }
        if (!IsNullOrEmpty($tag)) {
            if ($first) {
                $sql .= " WHERE exists (select 'x' from post_tags pt where pt.post_id = posts.post_id and pt.tag=?) ";
                $first = false;
            } else {
                $sql .= " AND exists (select 'x' from post_tags pt where pt.post_id = posts.post_id and pt.tag=?) ";
            }
            array_push($args, $tag);
        }
        if (!IsNullOrEmpty($tagType)) {
            if ($first) {
                $sql .= " WHERE exists (select 'x' from post_tags pt where pt.post_id = posts.post_id and pt.tag_type=?) ";
                $first = false;
            } else {
                $sql .= " AND exists (select 'x' from post_tags pt where pt.post_id = posts.post_id and pt.tag_type=?) ";
            }
            array_push($args, $tagType);
        }

        $sql .= " order by timestamp desc ";

        if (!IsNullOrEmpty($maxPosts)) {
            if (!IsNullOrEmpty($offset)) {
                $sql .= " LIMIT ".$offset.",".$maxPosts;
            } else {
                $sql .= " LIMIT ".$maxPosts;
            }
        }

        $json['SQL'] = $sql;
        try {
            $statement = $conn->prepare($sql);
            $statement->setFetchMode(PDO::FETCH_ASSOC);
            $statement->execute($args);
            $result = $statement->fetchAll();
        } catch (Exception $e) {
            $json['Exception'] =  $e->getMessage();
        }
        foreach ($result as $row1) {
            $json['posts'][] = $row1;
        }
    } elseif ($action == "getConnectionPosts") {
        $args = array();
        $sql = "SELECT posts.*, users.name FROM posts, users where posts.user_id = users.user_id   ";

        if ($showUserPosts == "true") {
            $sql .= "and (posts.user_id in (SELECT distinct connect_user_id from connections where connections.user_id = ?) OR posts.user_id = ?)";
            array_push($args, $userId);
        } else {
            $sql .= "and posts.user_id in (SELECT distinct connect_user_id from connections where connections.user_id = ?)";
        }

        array_push($args, $userId);

        $first = false;
        if (!IsNullOrEmpty($postId)) {
            if ($first) {
                $sql .= " WHERE post_id = ? ";
                $first = false;
            } else {
                $sql .= " AND post_id = ? ";
            }
            array_push($args, $postId);
        }

        if (!IsNullOrEmpty($postType)) {
            if ($first) {
                $sql .= " WHERE post_type = ? ";
                $first = false;
            } else {
                $sql .= " AND post_type = ? ";
            }
            array_push($args, $postType);
        }
        if (!IsNullOrEmpty($timestamp)) {
            if ($first) {
                $sql .= " WHERE timestamp = ? ";
                $first = false;
            } else {
                $sql .= " AND timestamp = ? ";
            }
            array_push($args, $timestamp);
        }
        if (!IsNullOrEmpty($postText)) {
            if ($first) {
                $sql .= " WHERE post_text = ? ";
                $first = false;
            } else {
                $sql .= " AND post_text = ? ";
            }
            array_push($args, $postText);
        }
        if (!IsNullOrEmpty($postPicUrl)) {
            if ($first) {
                $sql .= " WHERE post_pic_url = ? ";
                $first = false;
            } else {
                $sql .= " AND post_pic_url = ? ";
            }
            array_push($args, $postPicUrl);
        }
        if (!IsNullOrEmpty($commentFlag)) {
            if ($first) {
                $sql .= " WHERE comment_flag = ? ";
                $first = false;
            } else {
                $sql .= " AND comment_flag = ? ";
            }
            array_push($args, $commentFlag);
        }
        if (!IsNullOrEmpty($parentId)  && $parentId != "NULL") {
            if ($first) {
                $sql .= " WHERE parent_id = ? ";
                $first = false;
            } else {
                $sql .= " AND parent_id = ? ";
            }
            array_push($args, $parentId);
        } else {
            if ($first) {
                $sql .= " WHERE (parent_id is null or parent_id =  0)  ";
                $first = false;
            } else {
                $sql .= " AND (parent_id is null or parent_id =  0) ";
            }
        }

        $sql .= " order by timestamp desc ";

        if (!IsNullOrEmpty($maxPosts)) {
            if (!IsNullOrEmpty($offset)) {
                $sql .= " LIMIT ".$offset.",".$maxPosts;
            } else {
                $sql .= " LIMIT ".$maxPosts;
            }
        }

        $json['SQL'] = $sql;
        try {
            $statement = $conn->prepare($sql);
            $statement->setFetchMode(PDO::FETCH_ASSOC);
            $statement->execute($args);
            $result = $statement->fetchAll();
        } catch (Exception $e) {
            $json['Exception'] =  $e->getMessage();
        }
        foreach ($result as $row1) {
            $json['posts'][] = $row1;
        }
    } else {
        $json['Exeption'] = "Unrecognized Action ";
    }
} else {
    $json['Exeption'] = "Invalid JSON on Inbound Request";
}
echo json_encode($json);
closeConnections();
