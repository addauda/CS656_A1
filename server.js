const Server = require('./A1Server').A1Server;

//retrieve req_code from cli args
let raw_req_code = process.argv[2];

//throw error if null, empty
if (!raw_req_code) {
	throw "Missing Request Code";
}

//parse raw req_code
let req_code = parseInt(raw_req_code);

//throw error if NaN
if(!req_code) {
	throw "Invalid Request Code Format";
}

//create new server from class
const server = new Server(req_code);
