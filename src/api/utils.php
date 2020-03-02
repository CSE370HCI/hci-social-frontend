<?php
// Function for basic field validation (present and neither empty nor only white space
function IsNullOrEmpty($question)
{
    return (!isset($question) || trim($question)==='');
}
function isDateBetweenDates(DateTime $date, DateTime $startDate, DateTime $endDate)
{
    return $date > $startDate && $date < $endDate;
}

function isValidJSON($str)
{
   json_decode($str);
    return json_last_error() == JSON_ERROR_NONE;
}

function formatNull($str)
{
    if (IsNullOrEmpty($str)) {
       return null;
    }
    return $str;
}

function
validateAPIKey($userid, $key)
{
 $conn = getDbConnection();
$sql = "SELECT * FROM users WHERE user_id = ?";
$args = [$userid];
try {
$statement = $conn->prepare($sql);
$statement->setFetchMode(PDO::FETCH_ASSOC);
$statement->execute($args);
$result = $statement->fetchAll();
} catch(Exception $e) {
error_log("Error Validating API Key : ".$e->getMessage());
}
foreach($result as $row1) {
    error_log("Token was " +$row1['session_token']);
if ($row1['session_token'] == $key) {
return true;
}
}
return false;
}
