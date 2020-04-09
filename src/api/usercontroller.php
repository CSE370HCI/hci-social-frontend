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
    $userId = "";
    if (array_key_exists('userid', $decoded_params)) {
        $userId =  $decoded_params['userid'];
    }
    $username = "";
    if (array_key_exists('username', $decoded_params)) {
        $username =  $decoded_params['username'];
    }
    $emailAddr = "";
    if (array_key_exists('emailaddr', $decoded_params)) {
        $emailAddr =  $decoded_params['emailaddr'];
    }
    $password = "";
    if (array_key_exists('password', $decoded_params)) {
        $password =  $decoded_params['password'];
    }
    $sessionToken = "";
    if (array_key_exists('sessiontoken', $decoded_params)) {
        $sessionToken =  $decoded_params['sessiontoken'];
    }
    $otp = "";
    if (array_key_exists('otp', $decoded_params)) {
        $otp =  $decoded_params['otp'];
    }
    $status = "";
    if (array_key_exists('status', $decoded_params)) {
        $status =  $decoded_params['status'];
    }
    $name = "";
    if (array_key_exists('name', $decoded_params)) {
        $name =  $decoded_params['name'];
    }
    $firstName = "";
    if (array_key_exists('firstname', $decoded_params)) {
        $firstName =  $decoded_params['firstname'];
    }
    $lastName = "";
    if (array_key_exists('lastname', $decoded_params)) {
        $lastName =  $decoded_params['lastname'];
    }
    $userRole = "";
    if (array_key_exists('userrole', $decoded_params)) {
        $userRole =  $decoded_params['userrole'];
    }
    $authUserId = "";
    if (array_key_exists('user_id', $decoded_params)) {
        $authUserId =  $decoded_params['user_id'];
    }
    $sessionToken = "";
    if (array_key_exists('session_token', $decoded_params)) {
        $sessionToken =  $decoded_params['session_token'];
    }
    $mode = "ignorenulls";
    if (array_key_exists('mode', $decoded_params)) {
        $mode =  $decoded_params['mode'];
    }

    if ($action == "addOrEditUsers") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $args = array();
            if (IsNullOrEmpty($userId)) {
                $sql = "INSERT INTO users (username,email_addr,password,session_token,otp,status,name,first_name,last_name,user_role) VALUES ( ?,?,?,?,?,?,?,?,?,?,?);";

                array_push($args, $username);
                array_push($args, $emailAddr);
                array_push($args, $password);
                array_push($args, $sessionToken);
                array_push($args, $otp);
                array_push($args, $status);
                array_push($args, $name);
                array_push($args, $firstName);
                array_push($args, $lastName);
                array_push($args, $userRole);
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
                $first = true;
                $sql = "UPDATE users SET ";

                if ($mode == "erasenulls" || !IsNullOrEmpty($username)) {
                    if (!$first) {
                        $sql .= ',';
                    } else {
                        $first = false;
                    }
                    $sql .= "username = ? ";
                    array_push($args, $username);
                }

                if ($mode == "erasenulls" || !IsNullOrEmpty($emailAddr)) {
                    if (!$first) {
                        $sql .= ',';
                    } else {
                        $first = false;
                    }
                    $sql .= "email_addr = ? ";
                    array_push($args, $emailAddr);
                }

                if ($mode == "erasenulls" || !IsNullOrEmpty($status)) {
                    if (!$first) {
                        $sql .= ',';
                    } else {
                        $first = false;
                    }
                    $sql .= "status = ? ";
                    array_push($args, $status);
                }

                if ($mode == "erasenulls" || !IsNullOrEmpty($name)) {
                    if (!$first) {
                        $sql .= ',';
                    } else {
                        $first = false;
                    }
                    $sql .= "name = ? ";
                    array_push($args, $name);
                }

                if ($mode == "erasenulls" || !IsNullOrEmpty($firstName)) {
                    if (!$first) {
                        $sql .= ',';
                    } else {
                        $first = false;
                    }
                    $sql .= "first_name = ? ";
                    array_push($args, $firstName);
                }
                if ($mode == "erasenulls" || !IsNullOrEmpty($lastName)) {
                    if (!$first) {
                        $sql .= ',';
                    } else {
                        $first = false;
                    }
                    $sql .= "last_name = ? ";
                    array_push($args, $lastName);
                }
                if ($mode == "erasenulls" || !IsNullOrEmpty($userRole)) {
                    if (!$first) {
                        $sql .= ',';
                    } else {
                        $first = false;
                    }
                    $sql .= "user_role = ? ";
                    array_push($args, $userRole);
                }

                $sql .= " WHERE user_id = ?; ";
                array_push($args, $userId);

                $json['SQL'] = $sql;

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
    } elseif ($action == "deleteUsers") {
        if (validateAPIKey($authUserId, $sessionToken)) {
            $sql = "DELETE FROM users WHERE user_id = ?";
            $args = array();
            array_push($args, $userId);
            if (!IsNullOrEmpty($userId)) {
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
    } elseif ($action == "getUsers") {
        $args = array();
        $sql = "SELECT user_id, username, email_addr, status, name, first_name, last_name, user_role FROM users";
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
        if (!IsNullOrEmpty($username)) {
            if ($first) {
                $sql .= " WHERE username = ? ";
                $first = false;
            } else {
                $sql .= " AND username = ? ";
            }
            array_push($args, $username);
        }
        if (!IsNullOrEmpty($emailAddr)) {
            if ($first) {
                $sql .= " WHERE email_addr = ? ";
                $first = false;
            } else {
                $sql .= " AND email_addr = ? ";
            }
            array_push($args, $emailAddr);
        }

        if (!IsNullOrEmpty($status)) {
            if ($first) {
                $sql .= " WHERE status = ? ";
                $first = false;
            } else {
                $sql .= " AND status = ? ";
            }
            array_push($args, $status);
        }
        if (!IsNullOrEmpty($name)) {
            if ($first) {
                $sql .= " WHERE name = ? ";
                $first = false;
            } else {
                $sql .= " AND name = ? ";
            }
            array_push($args, $name);
        }
        if (!IsNullOrEmpty($firstName)) {
            if ($first) {
                $sql .= " WHERE first_name = ? ";
                $first = false;
            } else {
                $sql .= " AND first_name = ? ";
            }
            array_push($args, $firstName);
        }
        if (!IsNullOrEmpty($lastName)) {
            if ($first) {
                $sql .= " WHERE last_name = ? ";
                $first = false;
            } else {
                $sql .= " AND last_name = ? ";
            }
            array_push($args, $lastName);
        }
        if (!IsNullOrEmpty($userRole)) {
            if ($first) {
                $sql .= " WHERE user_role = ? ";
                $first = false;
            } else {
                $sql .= " AND user_role = ? ";
            }
            array_push($args, $userRole);
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
            $json['users'][] = $row1;
        }
    } elseif ($action == "getCompleteUsers") {
        $args = array();
        $sql = "SELECT user_id, username, email_addr, status, name, first_name, last_name, user_role  FROM users";
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
        if (!IsNullOrEmpty($username)) {
            if ($first) {
                $sql .= " WHERE username = ? ";
                $first = false;
            } else {
                $sql .= " AND username = ? ";
            }
            array_push($args, $username);
        }
        if (!IsNullOrEmpty($emailAddr)) {
            if ($first) {
                $sql .= " WHERE email_addr = ? ";
                $first = false;
            } else {
                $sql .= " AND email_addr = ? ";
            }
            array_push($args, $emailAddr);
        }
      
        if (!IsNullOrEmpty($status)) {
            if ($first) {
                $sql .= " WHERE status = ? ";
                $first = false;
            } else {
                $sql .= " AND status = ? ";
            }
            array_push($args, $status);
        }
        if (!IsNullOrEmpty($name)) {
            if ($first) {
                $sql .= " WHERE name = ? ";
                $first = false;
            } else {
                $sql .= " AND name = ? ";
            }
            array_push($args, $name);
        }
        if (!IsNullOrEmpty($firstName)) {
            if ($first) {
                $sql .= " WHERE first_name = ? ";
                $first = false;
            } else {
                $sql .= " AND first_name = ? ";
            }
            array_push($args, $firstName);
        }
        if (!IsNullOrEmpty($lastName)) {
            if ($first) {
                $sql .= " WHERE last_name = ? ";
                $first = false;
            } else {
                $sql .= " AND last_name = ? ";
            }
            array_push($args, $lastName);
        }
        if (!IsNullOrEmpty($userRole)) {
            if ($first) {
                $sql .= " WHERE user_role = ? ";
                $first = false;
            } else {
                $sql .= " AND user_role = ? ";
            }
            array_push($args, $userRole);
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
            //error_log("testing max connections");

            $conn2 = null;
            $sql = "SELECT connections.* FROM users, connections WHERE
             users.user_id = connections.user_id
              AND users.user_id = ".$row1['user_id'];
            $json['SQL connections'] = $sql;
            try {
                $conn2 = getDbConnection();
                $statement2 = $conn2->prepare($sql);
                $statement2->setFetchMode(PDO::FETCH_ASSOC);
                $statement2->execute();
                $result2 = $statement2->fetchAll();
            } catch (Exception $e) {
                $json['Exception'] =  $e->getMessage();
            }
            foreach ($result2 as $row2) {
                $row1['connections'][] = $row2;
            }
            $conn2 = null;

            $sql = "SELECT user_artifacts.* FROM users, user_artifacts WHERE
             users.user_id = user_artifacts.user_id
              AND users.user_id = ".$row1['user_id'];
            $json['SQL user_artifacts'] = $sql;
            try {
                $conn2 = getDbConnection();
                $statement2 = $conn2->prepare($sql);
                $statement2->setFetchMode(PDO::FETCH_ASSOC);
                $statement2->execute();
                $result2 = $statement2->fetchAll();
            } catch (Exception $e) {
                $json['Exception'] =  $e->getMessage();
            }
            foreach ($result2 as $row2) {
                $row1['user_artifacts'][] = $row2;
            }
            $sql = "SELECT user_prefs.* FROM users, user_prefs WHERE
             users.user_id = user_prefs.user_id
              AND users.user_id = ".$row1['user_id'];
            $json['SQL user_prefs'] = $sql;
            try {
                $conn2 = getDbConnection();
                $statement2 = $conn2->prepare($sql);
                $statement2->setFetchMode(PDO::FETCH_ASSOC);
                $statement2->execute();
                $result2 = $statement2->fetchAll();
            } catch (Exception $e) {
                $json['Exception'] =  $e->getMessage();
            }
            foreach ($result2 as $row2) {
                $row1['user_prefs'][] = $row2;
            }


            $conn2 = null;
            $sql = "SELECT group_members.* FROM users, group_members WHERE
             users.user_id = group_members.user_id
              AND users.user_id = ".$row1['user_id'];
            $json['SQL group_members'] = $sql;
            try {
                $conn2 = getDbConnection();
                $statement2 = $conn2->prepare($sql);
                $statement2->setFetchMode(PDO::FETCH_ASSOC);
                $statement2->execute();
                $result2 = $statement2->fetchAll();
            } catch (Exception $e) {
                $json['Exception'] =  $e->getMessage();
            }
            foreach ($result2 as $row2) {
                $row1['group_members'][] = $row2;
            }
            $json['users'][] = $row1;
            $conn2 = null;

            // close the connections each swing through the loop, or
            // mysql will run out of open connections if you have
            // more than a few users in the database and you ask for
            // them all.
            closeConnections();
        }
    } else {
        $json['Exeption'] = "Unrecognized Action ";
    }
} else {
    $json['Exeption'] = "Invalid JSON on Inbound Request";
}
echo json_encode($json);
closeConnections();
