<?php

$connections = array();

function getDbConnection()
{
    $servername = "stark.cse.buffalo.edu";
    $username = ""; // fill in your team user name here
    $password = ""; // fill in your team password here
    $dbname = ""; // fill in the team schema name here
    global $connections;

    error_log("Connecting to  ".$dbname." as user ".$username, 0);

    $conn = null;

    // Create connection
    try {
        $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        array_push($connections, $conn);
        return $conn;
    } catch (Exception $e) {
        echo "connection error ".$servername;
        error_log("Error Connecting to  ".$dbname." as user ".$username, 0);
    }
}

function closeConnections()
{
    global $connections;
    foreach ($connections as $conn) {
        $conn = null;
    }
}
