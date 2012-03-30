var http = require('http'),
    fileSystem = require('fs'),
    path = require('path')
    util = require('util');

var server = http.createServer(function(request, response) {
	request.on('close', function(){
		console.log('closed request');
	});
	
	var requestObject = require('url').parse(request.url, true);
			console.log(requestObject);
    var filePath = path.join(__dirname, 'test.mp3');
    var stat = fileSystem.statSync(filePath);

    response.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
    });

    var readStream = fileSystem.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to util.pump()
    util.pump(readStream, response);
})
.listen(8080);