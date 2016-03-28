<?php

require_once 'global.php';

chechkMethod('post');

$projects = new Table(JSON_PROJECTS);
$projects->delete($_POST['id']);
$projects->save();
response(true, array());
