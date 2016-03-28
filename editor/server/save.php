<?php

require_once 'global.php';

chechkMethod('post');

$projects = new Table(JSON_PROJECTS);

$data = isset($_REQUEST['data'])? json_decode($_REQUEST['data'], true) : array(
  'code' => array(),
  'record' => array(),
);

$code = array_merge(array(
  'html' => '',
  'css' => '',
  'js' => '',
), $data['code']);

$record = array_merge(array(
  'links' => null,
  'scripts' => null,
), $data['record']);

if(empty($record['links']))
  $record['links'] = null;

if(empty($record['scripts']))
  $record['scripts'] = null;

if(!isset($record['id']))
  $record['id'] = $projects->id();

$dir = 'project-'.$record['id'];

if(!isset($record['name']))
  $record['name'] = $dir;

$record = array_merge($record, array(
  'html' => "samples/{$dir}/index.html",
  'css' => "samples/{$dir}/styles.css",
  'js' => "samples/{$dir}/script.js",
));

@mkdir(dirname($record['html']), 0755, true);
@mkdir(dirname($record['css']), 0755, true);
@mkdir(dirname($record['js']), 0755, true);

file_put_contents($record['html'], $code['html']);
file_put_contents($record['css'], $code['css']);
file_put_contents($record['js'], $code['js']);

$projects->set($record['id'], $record);
$projects->save();

response(true, $record);