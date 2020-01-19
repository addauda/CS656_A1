const net = require('net');
const dgram = require('dgram');

class A1Server {
	constructor(req_code) {
		this.req_code = req_code;
		this.initTCPNeg();
	}

	initTCPNeg() {
		//create socket server
		const server = net.createServer(
			(socket) => {
				//event handler for when socket recieves data
				socket.on('data', (data) => {
					//parse data as integer request code
					let parsedCode = parseInt(data);

					//verify code against server request code
					//if false - close socket with message
					//else - begin UDP transaction stage
					(!parsedCode || parsedCode !== this.req_code) 
						? socket.end('Bad Request Code\n')
						: this.initUDPTrans((port) => { //define callback function to get transaction stage port number
							socket.end(`${port}\n`); 
						}
					);
				});
				//event handler for socket error
				socket.on('error', (err) => {
					socket.end(err.message.toString());
				});
			});
		
		//binds server to any available port and all network interfaces on host
		const listen = () => {
			server.listen(() => {
				console.log(`SERVER_PORT=${server.address().port}`);
			});
		}

		//handles socket server errors - in particular retrying next available port on listen error
		const handleError = (error) =>  {
			if (error.code === 'EADDRINUSE') {
				console.log('Address in use, retrying...');
				setTimeout(() => {
					server.close();
					listen();
				}, 1000);
			}
		}

		//set error handler
		server.on('error', handleError);

		//start bind process
		listen();
	}

	initUDPTrans(callback) {
		//create server for UDP datagrams
		const server = dgram.createSocket('udp4');

		//event handler for server error
		server.on('error', (err) => {
			console.log(`server error:\n${err.stack}`);
			server.close();
		});

		//event handler for when server receives message
		//reverses data and sends back on socket
		server.on('message', (msg, rinfo) => {
			server.send(`${msg.toString().split('').reverse().join('')}\n`, rinfo.port, rinfo.address);
		});
		
		//binds server to any available port and all network interfaces on host
		server.bind(0, () => {
			//check if callback exists - if yes, execute callback with server port
			(callback) && callback(server.address().port);
		});
	}
}

module.exports = {
	A1Server: A1Server
}