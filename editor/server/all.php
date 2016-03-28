<?php

require_once 'global.php';

$projects = new Table(JSON_PROJECTS);
response(true, $projects->all());
