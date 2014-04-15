var express = require("express");
var bodyParser = require("body-parser");
var fs = require('fs');
var winston = require('winston');
var dateFormat = require('dateformat');
var r = require('rethinkdb');
var config = require('./config')
var app = express();
var io;

var sock = { emit: function(){} }; // stub

process.stdin.resume();
winston.add(winston.transports.File, { filename: 'credit.log', json: false });
var database = __dirname + '/database.json';

var users,
	savedbtimeout;


var connection = null;
r.connect( {host: config.rethinkdb.host, port: config.rethinkdb.port, db: config.rethinkdb.db}, function(err, conn) {
	if (err) throw err;
    connection = conn;
    serverStart(connection);
})

app.use('/', express.static(__dirname + '/static'));
app.use(bodyParser());

// Read database
fs.readFile(database, 'utf8', function(err, data){
	if(err){
		if (err.code == "ENOENT") {
			winston.log('warn', 'No database found. Starting from scratch.');
			users = {};
		} else {
			winston.log('error', 'Can\'t read database: ' + err);
			process.exit();
		}
	} else {
		users = JSON.parse(data);
	}
	setInterval(backupDatabase, 24 * 60 * 60 * 1000); // 1 day
});

function serverStart(connection){
	server = require('http').createServer(app);
	io = require('socket.io').listen(server);

	io.sockets
	.on('connection', function (socket) {
		sock = socket;
		socket.emit('accounts', JSON.stringify(getAllUsers()));
	})
	.on('getAccounts', function (socket) {
		socket.emit('accounts', JSON.stringify(getAllUsers()));
	});

	var server = server.listen(8000, function(){
		winston.log('info', 'Server started!');
	})

	r.dbList().run(connection, function(err, list){
		if(list.indexOf(config.rethinkdb.db) == -1){
			r.dbCreate(config.rethinkdb.db).run(connection, function(err){
				if(err)
					criticalError("Couldn't create database.");
			});
		}
	});

	// Check if tables are present.
	r.db(config.rethinkdb.db).tableList().run(connection, function(err, tables){
		if(err)
			criticalError("Couldn't read table list.");

		if(tables.indexOf("users") == -1){
			r.db(config.rethinkdb.db).tableCreate('users').run(connection, function(err){
				if(err)
					criticalError("Couldn't create table 'users'.");
			})
		}
		if(tables.indexOf("transactions") == -1){
			r.db(config.rethinkdb.db).tableCreate('transactions').run(connection, function(err){
				if(err)
					criticalError("Couldn't create table 'transactions'.");
			})
		}
	});
}

// Write database
function saveDatabase(){
	fs.writeFile(database, JSON.stringify(users), function(err){
		if(err){
			winston.log('error', "Can't write database: " + err);
			return;
		}
	});
}

function backupDatabase(){
	var now = new Date();
	var dateformated = dateFormat(now, "yyyy-mm-dd");
	fs.writeFile(__dirname+'/backup/'+dateformated+'.json', JSON.stringify(users), function(err){
		if(err){
			winston.log('error', "Can't backup database: " + err);
			return;
		}
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
	saveDatabase();
});

app.post("/user/credit", function(req, res){
	var user = getUser(req.body.username);
	var delta = parseFloat(req.body.delta);

	if(user == undefined){
		res.send(404, "User not found");
		winston.log('error', '[userCredit] No user ' + req.body.username + ' found.')
		return;
	}
	if(isNaN(delta) || delta >= 100 || delta <= -100){
		res.send(406);
		winston.log('error', "[userCredit] delta must be a number.");
		return;
	}
	
	updateCredit(user, delta);
	
	saveUser(user);
	sock.broadcast.emit('accounts', JSON.stringify(getAllUsers()));
	sock.emit('accounts', JSON.stringify(getAllUsers()));
	sock.emit('ka-ching', JSON.stringify(getAllUsers()));
	res.send(JSON.stringify(user));
	saveDatabase();
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

	users[username] = {"name": username, "credit": 0, "lastchanged": Date.now()};
	sock.broadcast.emit('accounts', JSON.stringify(getAllUsers()));
	sock.emit('accounts', JSON.stringify(getAllUsers()));
	res.send(200);
	winston.log('info', '[addUser] New user ' + username + ' created');
	return true;
}

function getAllUsers(){
	var names = Object.keys(users);
	userlist = names.map(function(name){
		return users[name];
	});

	return userlist;
}

function updateCredit(user, delta) {
	user.credit += +delta;
	user.credit = Math.round(user.credit * 100) / 100;
	user.lastchanged = Date.now();

	r.table("transactions").insert({
	    username: user.name,
	    delta: delta,
	    credit: user.credit,
	    time: r.now()
	}).run(connection, function(err){
		if(err)
			winston.log('error', "Couldn't save transaction for user " + user.name + err);
	});

	winston.log('info', '[userCredit] Changed credit from user ' + user.name + ' by ' + delta + '. New credit: ' + user.credit);
}

function criticalError(errormsg){
	winston.log('error', errormsg);
	process.exit();
}

process.on('SIGTERM', function() {
	winston.log('info', 'Server shutting down. Good bye!');
	clearTimeout(savedbtimeout);
	process.exit();
});
