<?php
define('ROOT_PATH', dirname(__FILE__) . '/../');

function __autoload($class) {
	$path = ROOT_PATH . 'library/' . str_replace('\\', DIRECTORY_SEPARATOR, $class) . '.php';
	require_once($path);
}
