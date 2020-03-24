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
    $postTagId = "";
    if (array_key_exists('posttagid', $decoded_params)) {
        $postTagId =  $decoded_params['posttagid'];
    }

    // TODO : change to filter id in all the controllers
    $userId = "";
    if (array_key_exists('userid', $decoded_params)) {
        $userId =  $decoded_params['userid'];
    }
    $tag = "";
    if (array_key_exists('tag', $decoded_params)) {
        $tag =  $decoded_params['tag'];
    }
    $tagType = "";
    if (array_key_exists('tagtype', $decoded_params)) {
        $tagType =  $decoded_params['tagtype'];
    }
    $postId = "";
    if (array_key_exists('postid', $decoded_params)) {
        $postId =  $decoded_params['postid'];
    }
    $authUserId = "";
    if (array_key_exists('user_id', $decoded_params)) {
        $authUserId =  $decoded_params['user_id'];
    }
    $sessionToken = "";
    if (array_key_exists('session_token', $decoded_params)) {
        $sessionToken =  $decoded_params['session_token'];
    }
    if ($action == "addOrEditPostTags") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $args = array();
            if (IsNullOrEmpty($postTagId)) {
                $sql = "INSERT INTO post_tags (post_tag_id,user_id,tag,tag_type,post_id) VALUES ( ?,?,?,?,?);";
                array_push($args, $postTagId);
                array_push($args, $userId);
                array_push($args, $tag);
                array_push($args, $tagType);
                array_push($args, $postId);
                try {
                    $statement = $conn->prepare($sql);
                    $statement->execute($args);
                    $last_id = $conn->lastInsertId();
                    $json['Record Id'] = $last_id;
                    $json['Status'] = "SUCCESS - Inserted Id $last_id";
                } catch (Exception $e) {
                    $json['Exception'] =  $e->getMessage();
                }
            } else {
                $sql = "UPDATE post_tags SET user_id = ?,tag = ?,tag_type = ?,post_id = ? WHERE post_tag_id = ?; ";
                array_push($args, $userId);
                array_push($args, $tag);
                array_push($args, $tagType);
                array_push($args, $postId);
                array_push($args, $postTagId);
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
    } elseif ($action == "deletePostTags") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $sql = "DELETE FROM post_tags WHERE post_tag_id = ?";
            $args = array();
            array_push($args, $postTagId);
            if (!IsNullOrEmpty($postTagId)) {
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
    } elseif ($action == "getPostTags") {
        $args = array();
        $sql = "SELECT * FROM post_tags";
        $first = true;
        if (!IsNullOrEmpty($postTagId)) {
            if ($first) {
                $sql .= " WHERE post_tag_id = ? ";
                $first = false;
            } else {
                $sql .= " AND post_tag_id = ? ";
            }
            array_push($args, $postTagId);
        }
        if (!IsNullOrEmpty($userId)) {
            if ($first) {
                $sql .= " WHERE user_id = ? ";
                $first = false;
            } else {
                $sql .= " AND user_id = ? ";
            }
            array_push($args, $userId);
        }
        if (!IsNullOrEmpty($tag)) {
            if ($first) {
                $sql .= " WHERE tag = ? ";
                $first = false;
            } else {
                $sql .= " AND tag = ? ";
            }
            array_push($args, $tag);
        }
        if (!IsNullOrEmpty($tagType)) {
            if ($first) {
                $sql .= " WHERE tag_type = ? ";
                $first = false;
            } else {
                $sql .= " AND tag_type = ? ";
            }
            array_push($args, $tagType);
        }
        if (!IsNullOrEmpty($postId)) {
            if ($first) {
                $sql .= " WHERE post_id = ? ";
                $first = false;
            } else {
                $sql .= " AND post_id = ? ";
            }
            array_push($args, $postId);
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
            $json['post_tags'][] = $row1;
        }
    } else {
        $json['Exeption'] = "Unrecognized Action ";
    }
} else {
    $json['Exeption'] = "Invalid JSON on Inbound Request";
}
echo json_encode($json);
closeConnections();
