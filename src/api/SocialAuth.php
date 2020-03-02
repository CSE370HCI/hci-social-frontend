<?php

require 'utils.php';
require 'connect.php';

// the response will be a JSON object
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// pull the input, which should be in the form of a JSON object
$json_params = file_get_contents('php://input');
// check to make sure that the JSON is in a valid format
if (isValidJSON($json_params)) {
    $decoded_params = json_decode($json_params, true);
    $action = $decoded_params['action'];

    $json = array();

    if ($action == "login") {
        $username = $decoded_params["username"];
        $password = $decoded_params["password"];

        $conn = getDbConnection();
        $sql = "SELECT * FROM users WHERE email_addr = ?";
        $args = [$username];
        try {
            $statement = $conn->prepare($sql);
            $statement->setFetchMode(PDO::FETCH_ASSOC);
            $statement->execute($args);
            $result = $statement->fetchAll();
            if (count($result) < 1) {
                error_log("invalid username");
                $json["message"] = "Invalid username or password!";
            }
        } catch (Exception $e) {
            error_log("Error logging in : ".$e->getMessage());
        }
        foreach ($result as $row1) {
            if ($row1['password'] == hash('sha256', $password)) {
                // create the session Token
                $token = uniqid();
                $tokenSql = "UPDATE users SET session_token = '".$token."' WHERE user_id = ?";
                $args = [$row1['user_id']];
                $statement = $conn->prepare($tokenSql);
                $statement->setFetchMode(PDO::FETCH_ASSOC);
                $statement->execute($args);

                // forward to main page
                //$url = "testedit.html?userId=".$row1['user_id']."&token=".$token;
                $json["user"] = $row1;
                $json["user"]['session_token'] = $token;
            } else {
                error_log("invalid password!");
                $json["message"] = "Invalid username or password!";
            }
        }
        // forward to error page
    } elseif ($action == "register") {
        $conn = getDbConnection();
        $email = $_POST["email_addr"];
        $token = uniqid();
        $sql = "INSERT INTO users (email_addr, otp) VALUES (?,?)";
        $args = [$email, $token];
        $statement = $conn->prepare($sql);
        $statement->setFetchMode(PDO::FETCH_ASSOC);
        $statement->execute($args);

        mail($email, "otp", "Welcome to <appname> Your OTP is ".$token);
        $json["message"] = "Account created.  A confirmation email has been sent.";
    } elseif ($action == "setpassword") {
        $email = $_POST["email_addr"];
        $otp = $_POST["token"];
        $password = $_POST["newpassword"];
        $confirm = $_POST["confirmpassword"];

        $conn = getDbConnection();
        $sql = "SELECT * FROM users WHERE email_addr = ?";
        $args = [$email];
        try {
            $statement = $conn->prepare($sql);
            $statement->setFetchMode(PDO::FETCH_ASSOC);
            $statement->execute($args);
            $result = $statement->fetchAll();
        } catch (Exception $e) {
            error_log("Error logging in : ".$e->getMessage());
        }
        foreach ($result as $row1) {
            if ($row1['otp'] == $otp) {
                // create the session Token

                $tokenSql = "UPDATE users SET password = '".hash('sha256', $password)."' WHERE user_id = ?";
                $args = [$row1['user_id']];
                $statement = $conn->prepare($tokenSql);
                $statement->setFetchMode(PDO::FETCH_ASSOC);
                $statement->execute($args);
            } else {
                $json["message"] = "OTP Mismatch";
            }
        }
    } elseif ($action == "forgotpassword") {
        $email = $_POST["email_addr"];

        $conn = getDbConnection();
        $token = uniqid();
        $sql = "UPDATE users SET otp = '".$token."' WHERE email_addr = ?";
        $args = [$email];
        try {
            $statement = $conn->prepare($sql);
            $statement->setFetchMode(PDO::FETCH_ASSOC);
            $statement->execute($args);
            mail($email, "otp", "Your OTP is ".$token);
        } catch (Exception $e) {
            error_log("Error logging in : ".$e->getMessage());
        }
        $json["message"] =  "Sent OTP to ".$email;
    } else {
        $json["message"] = "Invalid command :".$action.":";
    }
} else {
    $json['Exeption'] = "Invalid JSON on Inbound Request";
}
echo json_encode($json);

closeConnections();
