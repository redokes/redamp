<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/config/bootstrap.php');
include(__DIR__ . '/AjaxController.php');
require_once(__DIR__ . '/CrudController.php');

$ajax = new AjaxController();
$ajax->parseRequest();
$controllerClass = $ajax->run();
if ($controllerClass) {
	$controllerClass->sendHeaders();
}