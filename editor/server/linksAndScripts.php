<?php

require_once 'global.php';

response(true, array(
  'links' => array(
    'angular-material.min.css' => array(
      'rel' => 'stylesheet',
      'href' => 'vendor/angular-material.min.css',
    ),
  ),
  'scripts' => array(
    'angular.min.js' => array(
      'src' => 'vendor/angular.min.js',
    ),
    'angular-animate.min.js' => array(
      'src' => 'vendor/angular-animate.min.js',
    ),
    'angular-aria.min.js' => array(
      'src' => 'vendor/angular-aria.min.js',
    ),
    'angular-sanitize.min.js' => array(
      'src' => 'vendor/angular-sanitize.min.js',
    ),
    'angular-material.min.js' => array(
      'src' => 'vendor/angular-material.min.js'
    ),
  ),
));
