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
    $connectionId = "";
    if (array_key_exists('connectionid', $decoded_params)) {
        $connectionId =  $decoded_params['connectionid'];
    }
    $userId = "";
    if (array_key_exists('userid', $decoded_params)) {
        $userId =  $decoded_params['userid'];
    }
    $connectUserId = "";
    if (array_key_exists('connectuserid', $decoded_params)) {
        $connectUserId =  $decoded_params['connectuserid'];
    }
    $connectionType = "";
    if (array_key_exists('connectiontype', $decoded_params)) {
        $connectionType =  $decoded_params['connectiontype'];
    }
    $connectionStatus = "";
    if (array_key_exists('connectionstatus', $decoded_params)) {
        $connectionStatus =  $decoded_params['connectionstatus'];
    }
    $userId = "";
    if (array_key_exists('user_id', $decoded_params)) {
        $userId =  $decoded_params['user_id'];
    }
    $sessionToken = "";
    if (array_key_exists('session_token', $decoded_params)) {
        $sessionToken =  $decoded_params['session_token'];
    }
    if ($action == "addOrEditConnections") {
        if (validateAPIKey($userId, $sessionToken)) {
            $args = array();
            if (IsNullOrEmpty($connectionId)) {
                $sql = "INSERT INTO connections (connection_id,user_id,connect_user_id,connection_type,connection_status) VALUES ( ?,?,?,?,?);";
                array_push($args, $connectionId);
                array_push($args, $userId);
                array_push($args, $connectUserId);
                array_push($args, $connectionType);
                array_push($args, $connectionStatus);
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
                $sql = "UPDATE connections SET user_id = ?,connect_user_id = ?,connection_type = ?,connection_status = ? WHERE connection_id = ?; ";
                array_push($args, $userId);
                array_push($args, $connectUserId);
                array_push($args, $connectionType);
                array_push($args, $connectionStatus);
                array_push($args, $connectionId);
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
    } elseif ($action == "deleteConnections") {
        if (validateAPIKey($userId, $sessionToken)) {
            $sql = "DELETE FROM connections WHERE connection_id = ?";
            $args = array();
            array_push($args, $connectionId);
            if (!IsNullOrEmpty($connectionId)) {
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
    } elseif ($action == "getConnections") {
        $args = array();
        $sql = "SELECT connections.*, users.name FROM connections, users where connections.connect_user_id = users.user_id  ";
        $first = false;
        if (!IsNullOrEmpty($connectionId)) {
            if ($first) {
                $sql .= " WHERE connection_id = ? ";
                $first = false;
            } else {
                $sql .= " AND connection_id = ? ";
            }
            array_push($args, $connectionId);
        }
        if (!IsNullOrEmpty($userId)) {
            if ($first) {
                $sql .= " WHERE connections.user_id = ? ";
                $first = false;
            } else {
                $sql .= " AND connections.user_id = ? ";
            }
            array_push($args, $userId);
        }
        if (!IsNullOrEmpty($connectUserId)) {
            if ($first) {
                $sql .= " WHERE connect_user_id = ? ";
                $first = false;
            } else {
                $sql .= " AND connect_user_id = ? ";
            }
            array_push($args, $connectUserId);
        }
        if (!IsNullOrEmpty($connectionType)) {
            if ($first) {
                $sql .= " WHERE connection_type = ? ";
                $first = false;
            } else {
                $sql .= " AND connection_type = ? ";
            }
            array_push($args, $connectionType);
        }
        if (!IsNullOrEmpty($connectionStatus)) {
            if ($first) {
                $sql .= " WHERE connection_status = ? ";
                $first = false;
            } else {
                $sql .= " AND connection_status = ? ";
            }
            array_push($args, $connectionStatus);
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
            $json['connections'][] = $row1;
        }
    } else {
        $json['Exeption'] = "Unrecognized Action ";
    }
} else {
    $json['Exeption'] = "Invalid JSON on Inbound Request";
}
echo json_encode($json);
closeConnections();
