<?php
require_once 'config/bootstrap.php';
?>
<!DOCTYPE html>
<html>
	<head>
		<title>RedAmp - Your music. Your browser.</title>
		<link type="text/css" rel="stylesheet" href="/js/ext-4.0.7/resources/css/files-theme.css" />
		<link type="text/css" rel="stylesheet" href="/js/redamp/resources/css/files.css" />
		<script type="text/javascript" src="/js/ext-4.0.7/ext-all.js"></script>
		<script type="text/javascript" src="/js/bootstrap.js"></script>
	</head>
	<body>
		<script>
			Ext.onReady(function() {
				Ext.require('RedAmp.Application');
			});
		</script>
	</body>
</html>