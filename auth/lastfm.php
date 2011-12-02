<!DOCTYPE html>
<html>
	<head>
		<title></title>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	</head>
	<body>
		<script type="text/javascript">
			var lastFm = window.opener.RedAmp.lastfm.api.Api;
			var Ext = window.opener.Ext;
			var locationSplit = window.location.href.split('?');
			if(locationSplit.length >= 2){
				lastFm.authenticate(Ext.Object.fromQueryString(locationSplit[1]));
			}
			window.close();
		</script>
	</body>
</html>
