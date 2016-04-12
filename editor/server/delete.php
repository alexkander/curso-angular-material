<?php

require_once dirname(__FILE__).'/private/global.php';

chechkMethod('post');

$id = @$_POST['id'];
$p = new Project($id);

response($p->delete());
