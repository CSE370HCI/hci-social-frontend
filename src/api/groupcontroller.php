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
    $groupId = "";
    if (array_key_exists('groupid', $decoded_params)) {
        $groupId =  $decoded_params['groupid'];
    }
    $userId = "";
    if (array_key_exists('userid', $decoded_params)) {
        $userId =  $decoded_params['userid'];
    }
    $groupName = "";
    if (array_key_exists('groupname', $decoded_params)) {
        $groupName =  $decoded_params['groupname'];
    }
    $groupType = "";
    if (array_key_exists('grouptype', $decoded_params)) {
        $groupType =  $decoded_params['grouptype'];
    }
    $authUserId = "";
    if (array_key_exists('user_id', $decoded_params)) {
        $authUserId =  $decoded_params['user_id'];
    }
    $sessionToken = "";
    if (array_key_exists('session_token', $decoded_params)) {
        $sessionToken =  $decoded_params['session_token'];
    }
    if ($action == "addOrEditGroups") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $args = array();
            if (IsNullOrEmpty($groupId)) {
                $sql = "INSERT INTO groups (group_id,user_id,group_name,group_type) VALUES ( ?,?,?,?);";
                array_push($args, $groupId);
                array_push($args, $userId);
                array_push($args, $groupName);
                array_push($args, $groupType);
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
                $sql = "UPDATE groups SET user_id = ?,group_name = ?,group_type = ? WHERE group_id = ?; ";
                array_push($args, $userId);
                array_push($args, $groupName);
                array_push($args, $groupType);
                array_push($args, $groupId);
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
    } elseif ($action == "deleteGroups") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $sql = "DELETE FROM groups WHERE group_id = ?";
            $args = array();
            array_push($args, $groupId);
            if (!IsNullOrEmpty($groupId)) {
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
    } elseif ($action == "getGroups") {
        $args = array();
        $sql = "SELECT * FROM groups";
        $first = true;
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
        if (!IsNullOrEmpty($groupName)) {
            if ($first) {
                $sql .= " WHERE group_name = ? ";
                $first = false;
            } else {
                $sql .= " AND group_name = ? ";
            }
            array_push($args, $groupName);
        }
        if (!IsNullOrEmpty($groupType)) {
            if ($first) {
                $sql .= " WHERE group_type = ? ";
                $first = false;
            } else {
                $sql .= " AND group_type = ? ";
            }
            array_push($args, $groupType);
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
            $json['groups'][] = $row1;
        }
    } else {
        $json['Exeption'] = "Unrecognized Action ";
    }
} else {
    $json['Exeption'] = "Invalid JSON on Inbound Request";
}
echo json_encode($json);
closeConnections();
