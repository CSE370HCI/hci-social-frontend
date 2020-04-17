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
    $gmId = "";
    if (array_key_exists('gmid', $decoded_params)) {
        $gmId =  $decoded_params['gmid'];
    }
    $groupId = "";
    if (array_key_exists('groupid', $decoded_params)) {
        $groupId =  $decoded_params['groupid'];
    }
    $userId = "";
    if (array_key_exists('userid', $decoded_params)) {
        $userId =  $decoded_params['userid'];
    }
    $memberType = "";
    if (array_key_exists('membertype', $decoded_params)) {
        $memberType =  $decoded_params['membertype'];
    }
    $authUserId = "";
    if (array_key_exists('user_id', $decoded_params)) {
        $authUserId =  $decoded_params['user_id'];
    }
    $sessionToken = "";
    if (array_key_exists('session_token', $decoded_params)) {
        $sessionToken =  $decoded_params['session_token'];
    }
    if ($action == "addOrEditGroupMembers") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $args = array();
            if (IsNullOrEmpty($gmId)) {
                if (IsNullOrEmpty($userId) || IsNullOrEmpty($groupId)) {
                    $json['Status'] = "ERROR - Missing required fields.  Both userid and groupid are required. ";
                } else {
                    $sql = "INSERT INTO group_members (gm_id,group_id,user_id,member_type) VALUES ( ?,?,?,?);";
                    array_push($args, $gmId);
                    array_push($args, $groupId);
                    array_push($args, $userId);
                    array_push($args, $memberType);
                    try {
                        $statement = $conn->prepare($sql);
                        $statement->execute($args);
                        $last_id = $conn->lastInsertId();
                        $json['Record Id'] = $last_id;
                        $json['Status'] = "SUCCESS - Inserted Id $last_id";
                    } catch (Exception $e) {
                        $json['Exception'] =  $e->getMessage();
                    }
                }
            } else {
                $sql = "UPDATE group_members SET group_id = ?,user_id = ?,member_type = ? WHERE gm_id = ?; ";
                array_push($args, $groupId);
                array_push($args, $userId);
                array_push($args, $memberType);
                array_push($args, $gmId);
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
    } elseif ($action == "deleteGroupMembers") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $sql = "DELETE FROM group_members WHERE gm_id = ?";
            $args = array();
            array_push($args, $gmId);
            if (!IsNullOrEmpty($gmId)) {
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
    } elseif ($action == "getGroupMembers") {
        $args = array();
        $sql = "SELECT * FROM group_members";
        $first = true;
        if (!IsNullOrEmpty($gmId)) {
            if ($first) {
                $sql .= " WHERE gm_id = ? ";
                $first = false;
            } else {
                $sql .= " AND gm_id = ? ";
            }
            array_push($args, $gmId);
        }
        if (!IsNullOrEmpty($groupId)) {
            if ($first) {
                $sql .= " WHERE group_id = ? ";
                $first = false;
            } else {
                $sql .= " AND group_id = ? ";
            }
            array_push($args, $groupId);
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
        if (!IsNullOrEmpty($memberType)) {
            if ($first) {
                $sql .= " WHERE member_type = ? ";
                $first = false;
            } else {
                $sql .= " AND member_type = ? ";
            }
            array_push($args, $memberType);
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
            $json['group_members'][] = $row1;
        }
    } else {
        $json['Exeption'] = "Unrecognized Action ";
    }
} else {
    $json['Exeption'] = "Invalid JSON on Inbound Request";
}
echo json_encode($json);
closeConnections();
