<?php

require_once dirname(__FILE__).'/private/global.php';

chechkMethod('post');

$data = isset($_POST['data'])? json_decode($_POST['data'], true) : array(
  'codes' => array(),
  'record' => array(),
);

$p = new Project(@$data['record']['id']);

$p->name = @$data['record']['name'];
$p->type = @$data['record']['type'];

if(!isset($p->type))
  $p->type = '';

$p->save($data['codes']);

response($p->arr());
