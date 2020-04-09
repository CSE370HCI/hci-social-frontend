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
    $messageId = "";
    if (array_key_exists('messageid', $decoded_params)) {
        $messageId =  $decoded_params['messageid'];
    }
    $userId = "";
    if (array_key_exists('userid', $decoded_params)) {
        $userId =  $decoded_params['userid'];
    }
    $recipientId = "";
    if (array_key_exists('recipientid', $decoded_params)) {
        $recipientId =  $decoded_params['recipientid'];
    }
    $groupId = "";
    if (array_key_exists('groupid', $decoded_params)) {
        $groupId =  $decoded_params['groupid'];
    }
    $message = "";
    if (array_key_exists('message', $decoded_params)) {
        $message =  $decoded_params['message'];
    }
    $authUserId = "";
    if (array_key_exists('user_id', $decoded_params)) {
        $authUserId =  $decoded_params['user_id'];
    }
    $sessionToken = "";
    if (array_key_exists('session_token', $decoded_params)) {
        $sessionToken =  $decoded_params['session_token'];
    }
    if ($action == "addOrEditMessages") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $args = array();
            if (IsNullOrEmpty($messageId)) {
                $sql = "INSERT INTO messages (message_id,user_id,recipient_id,group_id,message) VALUES ( ?,?,?,?,?);";
                array_push($args, $messageId);
                array_push($args, $userId);
                array_push($args, $recipientId);
                array_push($args, $groupId);
                array_push($args, $message);
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
                $sql = "UPDATE messages SET user_id = ?,recipient_id = ?,group_id = ?,message = ? WHERE message_id = ?; ";
                array_push($args, $userId);
                array_push($args, $recipientId);
                array_push($args, $groupId);
                array_push($args, $message);
                array_push($args, $messageId);
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
    } elseif ($action == "deleteMessages") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $sql = "DELETE FROM messages WHERE message_id = ?";
            $args = array();
            array_push($args, $messageId);
            if (!IsNullOrEmpty($messageId)) {
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
    } elseif ($action == "getMessages") {
        $args = array();
        $sql = "SELECT * FROM messages";
        $first = true;
        if (!IsNullOrEmpty($messageId)) {
            if ($first) {
                $sql .= " WHERE message_id = ? ";
                $first = false;
            } else {
                $sql .= " AND message_id = ? ";
            }
            array_push($args, $messageId);
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
        if (!IsNullOrEmpty($recipientId)) {
            if ($first) {
                $sql .= " WHERE recipient_id = ? ";
                $first = false;
            } else {
                $sql .= " AND recipient_id = ? ";
            }
            array_push($args, $recipientId);
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
        if (!IsNullOrEmpty($message)) {
            if ($first) {
                $sql .= " WHERE message = ? ";
                $first = false;
            } else {
                $sql .= " AND message = ? ";
            }
            array_push($args, $message);
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
            $json['messages'][] = $row1;
        }
    } elseif ($action == "getConversations") {
        $args = array();
        $sql = "SELECT distinct recipient_id FROM messages ";
        $first = true;

        if (!IsNullOrEmpty($userId)) {
            if ($first) {
                $sql .= " WHERE user_id = ? ";
                $first = false;
            } else {
                $sql .= " AND user_id = ? ";
            }
            array_push($args, $userId);
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
            $json['recipient_ids'][] = $row1["recipient_id"];
        }
    } else {
        $json['Exeption'] = "Unrecognized Action ";
    }
} else {
    $json['Exeption'] = "Invalid JSON on Inbound Request";
}
echo json_encode($json);
closeConnections();
