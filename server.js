var express = require("express");
var bodyParser = require("body-parser");
var fs = require('fs');
var winston = require('winston');
var app = express();

winston.add(winston.transports.File, { filename: 'credit.log', json: false });

var database = __dirname + '/database.json';

var users;

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
});

// Write database
function saveDatabase(){
	fs.writeFile(database, JSON.stringify(users), function(err){
		if(err){
			console.log("Can't write database: " + err);
			return;
		}
		setTimeout(saveDatabase, 1000);
	});
}

app.get("/users/all", function(req, res){
	res.send(JSON.stringify(getAllUsers()));
});

app.post("/user/credit", function(req, res){
	var user = getUser(req.body.username);
	if(user == undefined){
		res.send(404, "User not found.");
		return;
	}
	user.credit += +req.body.delta;
	saveUser(user);
	res.send(JSON.stringify(user));
});

function getUser(username){
	return users[username];
}

function saveUser(user){
	users[user.name] = user;
}

function getAllUsers(){
	var names = Object.keys(users);
	return names.map(function(name){
		return users[name];
	});
}

var server = app.listen(8000, function(){
	winston.log('info', 'Server started!');
})