<?php

include_once('users.php');

$username = $_POST['username'];
$password = $_POST['password'];

if ($username && $password) {
    if (login($username, $password))
        echo 'Logged in!';
    else
        echo 'Invalid match.';
}