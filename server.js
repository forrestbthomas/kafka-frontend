var WebSocketServer = require('websocket').server;
var http = require('http');
var exec = require('child_process').spawn;

var path = require('path');
var fs = require('fs');


// 
// Configuration 
// 

var config = {

	// www root
	root: 'dist',

	// default file to serve
	index: 'index.html',

	// http listen port
	port: process.env.PORT || 3000

};


// 
// HTTP Server
// 

var server = require('http').createServer(function (request, response) {
	var file = path.normalize(config.root + request.url);
	console.log('req: ', file)
	file = (file == config.root + '/') ? file + config.index : file;

	console.log('Trying to serve: ', file);

	function showError(error) {
		console.log(error);

		response.writeHead(500);
		response.end('Internal Server Error');
	}

	fs.exists(file, function (exists) {
		if (exists) {
			fs.stat(file, function (error, stat) {
				var readStream;

				if (error) {
					return showError(error);
				}

				if (stat.isDirectory()) {
					response.writeHead(403);
					response.end('Forbidden');
				}
				else {
					readStream = fs.createReadStream(file);

					readStream.on('error', showError);

					response.writeHead(200);
					readStream.pipe(response);
				}
			});
		}
		else {
			response.writeHead(404);
			response.end('Not found');
		}
	});

});

server.listen(config.port, function() {
	console.log('Server running at http://localhost:%d', config.port);
});


wsServer = new WebSocketServer({httpServer: server});
wsServer.on('request', function(request) {
	var connection = request.accept(null, request.origin);
	var kafkaBin = "/Users/forrestbthomas/kafka_install/kafka_2.11-1.0.0/bin/kafka-console-consumer.sh"
	var k = exec(kafkaBin, ["--bootstrap-server", "localhost:9092", "--topic", process.argv[2] || "test", "--from-beginning"])

	k.stderr.on('data', (data) => {
		console.log(`stderr: ${data}`)
	});
	k.stdout.on('data', (data) => {
		console.log(`stdout: ${data}`);
		data = data.toString().split("\n").join('')
		fs.appendFile('./dist/data/us.csv', data + '\n', (err) => {
			if (err) throw err;
			connection.sendUTF('Appended: ', data);
			console.log('sent: ', data)
		});

		console.log("sending to client")
		connection.sendUTF(data.toString());
	});
	k.on('error', (err) => {console.log(`error: ${err}`)})
	k.on('close', () => { console.log("closing....")});
});
