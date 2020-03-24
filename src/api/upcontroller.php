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
    $prefId = "";
    if (array_key_exists('prefid', $decoded_params)) {
        $prefId =  $decoded_params['prefid'];
    }
    $userId = "";
    if (array_key_exists('userid', $decoded_params)) {
        $userId =  $decoded_params['userid'];
    }
    $prefName = "";
    if (array_key_exists('prefname', $decoded_params)) {
        $prefName =  $decoded_params['prefname'];
    }
    $prefValue = "";
    if (array_key_exists('prefvalue', $decoded_params)) {
        $prefValue =  $decoded_params['prefvalue'];
    }
    $authUserId = "";
    if (array_key_exists('user_id', $decoded_params)) {
        $authUserId =  $decoded_params['user_id'];
    }
    $sessionToken = "";
    if (array_key_exists('session_token', $decoded_params)) {
        $sessionToken =  $decoded_params['session_token'];
    }
    if ($action == "addOrEditUserPrefs") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $args = array();
            if (IsNullOrEmpty($prefId)) {
                $sql = "INSERT INTO user_prefs (pref_id,user_id,pref_name,pref_value) VALUES ( ?,?,?,?);";
                array_push($args, $prefId);
                array_push($args, $userId);
                array_push($args, $prefName);
                array_push($args, $prefValue);
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
                $sql = "UPDATE user_prefs SET user_id = ?,pref_name = ?,pref_value = ? WHERE pref_id = ?; ";
                array_push($args, $userId);
                array_push($args, $prefName);
                array_push($args, $prefValue);
                array_push($args, $prefId);
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
    } elseif ($action == "deleteUserPrefs") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $sql = "DELETE FROM user_prefs WHERE pref_id = ?";
            $args = array();
            array_push($args, $prefId);
            if (!IsNullOrEmpty($prefId)) {
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
    } elseif ($action == "getUserPrefs") {
        $args = array();
        $sql = "SELECT * FROM user_prefs";
        $first = true;
        if (!IsNullOrEmpty($prefId)) {
            if ($first) {
                $sql .= " WHERE pref_id = ? ";
                $first = false;
            } else {
                $sql .= " AND pref_id = ? ";
            }
            array_push($args, $prefId);
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
        if (!IsNullOrEmpty($prefName)) {
            if ($first) {
                $sql .= " WHERE pref_name = ? ";
                $first = false;
            } else {
                $sql .= " AND pref_name = ? ";
            }
            array_push($args, $prefName);
        }
        if (!IsNullOrEmpty($prefValue)) {
            if ($first) {
                $sql .= " WHERE pref_value = ? ";
                $first = false;
            } else {
                $sql .= " AND pref_value = ? ";
            }
            array_push($args, $prefValue);
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
            $json['user_prefs'][] = $row1;
        }
    } else {
        $json['Exeption'] = "Unrecognized Action ";
    }
} else {
    $json['Exeption'] = "Invalid JSON on Inbound Request";
}
echo json_encode($json);
closeConnections();
