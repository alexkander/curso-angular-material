<?php

require_once dirname(__FILE__).'/private/global.php';

response(Project::all());
