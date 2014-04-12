var express = require("express");
var bodyParser = require("body-parser");
var fs = require('fs');
var winston = require('winston');
var dateFormat = require('dateformat');
var app = express();

process.stdin.resume();
winston.add(winston.transports.File, { filename: 'credit.log', json: false });
var database = __dirname + '/database.json';

var users,
	savedbtimeout;

app.all('/', function(req, res, next) {

 });

app.use('/', express.static(__dirname + '/static'));
app.use(bodyParser());


// Read database
fs.readFile(database, 'utf8', function(err, data){
	if(err){
		winston.log('error', 'Can\'t read database: ' + err);
		process.exit();
	}

	users = JSON.parse(data);
	saveDatabase();
	backupDatabase();
});

// Write database
function saveDatabase(){
	fs.writeFile(database, JSON.stringify(users), function(err){
		if(err){
			winston.log('error', "Can't write database: " + err);
			return;
		}
		savedbtimeout = setTimeout(saveDatabase, 1000);
	});
}

function backupDatabase(){
	var now = new Date();
	var dateformated = dateFormat(now, "isoDateTime");
	fs.writeFile(__dirname+'/backup/'+dateformated+'.json', JSON.stringify(users), function(err){
		if(err){
			winston.log('error', "Can't backup database: " + err);
			return;
		}
		setTimeout(backupDatabase, 60000);
	});
}

app.get("/users/all", function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.send(JSON.stringify(getAllUsers()));
});

app.post('/user/add', function(req, res){
	var username = req.body.username;
	addUser(username, res);
	
});

app.post("/user/credit", function(req, res){
	var user = getUser(req.body.username);
	if(user == undefined){
		res.send(404, "User not found");
		winston.log('error', '[userCredit] No user ' + req.body.username + ' found.')
		return;
	}
	user.credit += +req.body.delta;
	user.credit = Math.round(user.credit * 100) / 100;
	winston.log('info', '[userCredit] Changed credit from user ' + user.name + ' by ' + req.body.delta + '. New credit: ' + user.credit);
	saveUser(user);
	res.send(JSON.stringify(user));
});

function getUser(username){
	return users[username];
}

function saveUser(user){
	users[user.name] = user;
}

function addUser(username, res){
	if(username == undefined || username == ""){
		res.send(406, "No username set");
		winston.log('error', '[addUser] No username set.')
		return false;
	}
	if(users[username]){
		res.send(409, "User already exists");
		winston.log('error', '[addUser] User ' + username + ' already exists.');
		return false;
	}

	users[username] = {"name": username, "credit": 0};
	res.send(200);
	winston.log('info', '[addUser] New user ' + username + ' created');
	return true;
}

function getAllUsers(){
	var names = Object.keys(users);
	return names.map(function(name){
		return users[name];
	});
}

process.on('SIGTERM', function() {
	winston.log('info', 'Server shutting down. Good bye!');
	clearTimeout(savedbtimeout);
	process.exit();
});

var server = app.listen(8000, function(){
	winston.log('info', 'Server started!');
})