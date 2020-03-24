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
    $artifactId = "";
    if (array_key_exists('artifactid', $decoded_params)) {
        $artifactId =  $decoded_params['artifactid'];
    }
    $userId = "";
    if (array_key_exists('userid', $decoded_params)) {
        $userId =  $decoded_params['userid'];
    }
    $artifactType = "";
    if (array_key_exists('artifacttype', $decoded_params)) {
        $artifactType =  $decoded_params['artifacttype'];
    }
    $artifactUrl = "";
    if (array_key_exists('artifacturl', $decoded_params)) {
        $artifactUrl =  $decoded_params['artifacturl'];
    }
    $artifactCategory = "";
    if (array_key_exists('artifactcategory', $decoded_params)) {
        $artifactCategory =  $decoded_params['artifactcategory'];
    }
    $authUserId = "";
    if (array_key_exists('user_id', $decoded_params)) {
        $authUserId =  $decoded_params['user_id'];
    }
    $sessionToken = "";
    if (array_key_exists('session_token', $decoded_params)) {
        $sessionToken =  $decoded_params['session_token'];
    }
    if ($action == "addOrEditUserArtifacts") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $args = array();
            if (IsNullOrEmpty($artifactId)) {
                $sql = "INSERT INTO user_artifacts (artifact_id,user_id,artifact_type,artifact_url,artifact_category) VALUES ( ?,?,?,?,?);";
                array_push($args, $artifactId);
                array_push($args, $userId);
                array_push($args, $artifactType);
                array_push($args, $artifactUrl);
                array_push($args, $artifactCategory);
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
                $sql = "UPDATE user_artifacts SET user_id = ?,artifact_type = ?,artifact_url = ?,artifact_category = ? WHERE artifact_id = ?; ";
                array_push($args, $userId);
                array_push($args, $artifactType);
                array_push($args, $artifactUrl);
                array_push($args, $artifactCategory);
                array_push($args, $artifactId);
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
    } elseif ($action == "deleteUserArtifacts") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $sql = "DELETE FROM user_artifacts WHERE artifact_id = ?";
            $args = array();
            array_push($args, $artifactId);
            if (!IsNullOrEmpty($artifactId)) {
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
    } elseif ($action == "getUserArtifacts") {
        $args = array();
        $sql = "SELECT * FROM user_artifacts";
        $first = true;
        if (!IsNullOrEmpty($artifactId)) {
            if ($first) {
                $sql .= " WHERE artifact_id = ? ";
                $first = false;
            } else {
                $sql .= " AND artifact_id = ? ";
            }
            array_push($args, $artifactId);
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
        if (!IsNullOrEmpty($artifactType)) {
            if ($first) {
                $sql .= " WHERE artifact_type = ? ";
                $first = false;
            } else {
                $sql .= " AND artifact_type = ? ";
            }
            array_push($args, $artifactType);
        }
        if (!IsNullOrEmpty($artifactUrl)) {
            if ($first) {
                $sql .= " WHERE artifact_url = ? ";
                $first = false;
            } else {
                $sql .= " AND artifact_url = ? ";
            }
            array_push($args, $artifactUrl);
        }
        if (!IsNullOrEmpty($artifactCategory)) {
            if ($first) {
                $sql .= " WHERE artifact_category = ? ";
                $first = false;
            } else {
                $sql .= " AND artifact_category = ? ";
            }
            array_push($args, $artifactCategory);
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
            $json['user_artifacts'][] = $row1;
        }
    } else {
        $json['Exeption'] = "Unrecognized Action ";
    }
} else {
    $json['Exeption'] = "Invalid JSON on Inbound Request";
}
echo json_encode($json);
closeConnections();
