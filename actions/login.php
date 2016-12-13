<?php
include_once('../database/users.php');
session_start(['cookie_httponly' => true]);

$username = htmlspecialchars($_POST['username']);
$password = htmlspecialchars($_POST['password']);

if ($username && $password) {
    if (login($username, $password)) {
        unset($_SESSION['login-error']);
        initializeSession($username);
    } else
        $_SESSION['login-error'] = 'The username and the password do not match.';

    header('Location: ' . $_SERVER['HTTP_REFERER']);
    die();
}

function initializeSession($username) {
    session_regenerate_id(true);
    $_SESSION['username'] = $username;
    $_SESSION['userId'] = getIdByUsername($username);
    $_SESSION['email'] = getUserField($_SESSION['userId'], 'Email');
    $_SESSION['name'] = getUserField($_SESSION['userId'], 'Name');
    $_SESSION['groupId'] = getUserField($_SESSION['userId'], 'GroupID');
}