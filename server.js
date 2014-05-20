var express = require("express");
var bodyParser = require("body-parser");
var winston = require('winston');
var dateFormat = require('dateformat');
var r = require('rethinkdb');
var config = require('./config');
var app = express();
var io;

var sock = { emit: function(){} }; // stub

process.stdin.resume();
winston.add(winston.transports.File, { filename: 'credit.log', json: false });

var users;


var connection = null;
r.connect( {host: config.rethinkdb.host, port: config.rethinkdb.port, db: config.rethinkdb.db}, function(err, conn) {
	if (err) {criticalError("Couldn't connect to RethinkDB.");}
    connection = conn;
    serverStart(connection);
})

app.use('/', express.static(__dirname + '/static'));
app.use(bodyParser());


function serverStart(connection){
	server = require('http').createServer(app);
	io = require('socket.io').listen(server);

	io.sockets
	.on('connection', function (socket) {
		sock = socket;
		getAllUsersAsync(function(data){
			socket.emit('accounts', JSON.stringify(data));
		});
		socket.on('getAccounts', function (data) {
			getAllUsersAsync(function(data){
				socket.emit('accounts', JSON.stringify(data));
			});
		})
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
			r.db(config.rethinkdb.db).tableCreate('users', {primaryKey: "name"}).run(connection, function(err){
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


app.get("/users/all", function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	getAllUsersAsync(function(data){
		res.send(JSON.stringify(data));
	});
});

app.get("/transactions/all", function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	getAllTransactionsAsync(function(data){
		res.send(JSON.stringify(data));
	});
});

app.get("/transactions/:name", function(req, res){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	getUserTransactionsAsync(req.params.name, function(data){
		console.log(data);
		res.send(data);
	});
});

app.post('/user/add', function(req, res){
	var username = req.body.username;
	addUser(username, res);
});

app.post('/user/rename', function(req, res){
	var user = undefined;
	getUserAsync(req.body.username, function(userObj){
		user = userObj;

		var newname = req.body.newname;

		if(user == undefined){
			res.send(404, "User not found");
			winston.log('error', '[userCredit] No user ' + req.body.username + ' found.')
			return;
		}

		renameUser(user, newname, res);
		
		getAllUsersAsync(function(users){
			sock.broadcast.emit('accounts', JSON.stringify(users));
			sock.emit('accounts', JSON.stringify(users));
			res.send(JSON.stringify(user));
		});

	})
});

app.post("/user/credit", function(req, res){
	var user = undefined;
	getUserAsync(req.body.username, function(userObj){
		user = userObj;

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
		
		getAllUsersAsync(function(users){
			sock.broadcast.emit('accounts', JSON.stringify(users));
			sock.emit('accounts', JSON.stringify(users));
			res.send(JSON.stringify(user));
		});

	})
});

function getUserAsync(username, cb){
	r.table("users").get(username).run(connection, function(e, table){
        if(e){throw e}
        cb(table);
    })	
}

function getAllUsersAsync(cb){
    r.table("users").run(connection, function(e, table){
        if(e){throw e}
        table.toArray(function(e, data){
        	if(e){throw e}
        	cb(data);
        })
    })
}

function getUserTransactionsAsync(username, cb){
	r.table('transactions').filter(r.row('username').eq(username)).
    run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
            if (err) throw err;
            cb(JSON.stringify(result, null, 2));
        });
    });
}

function getAllTransactionsAsync(cb){
    r.table("transactions").run(connection, function(e, table){
        if(e){throw e}
        table.toArray(function(e, data){
        	if(e){throw e}
        	cb(data);
        })
    })
}


function addUser(username, res){
	r.table("users").insert({
	    name: username,
	    credit: 0,
	    lastchanged: r.now()
	}).run(connection, function(err, dbres){
		if(dbres.errors){
			winston.log('error', "Couldn't save user " + username + err);
			res.send(409, "User exists already.");
		}else{
			getAllUsersAsync(function(users){
				sock.broadcast.emit('accounts', JSON.stringify(users));
				sock.emit('accounts', JSON.stringify(users));

				res.send(200);
				winston.log('info', '[addUser] New user ' + username + ' created');
				return true;
			});
		}
	});
}

function renameUser(user, newname, res) {
	r.table("users")
		.filter({name: user.name})
		.update({name: newname, lastchanged: r.now()})
		.run(connection, function(err, dbres){
			if(dbres.errors)
				winston.log('error', "Couldn't rename user " + user.name + ", because " + err + " " + dbres);
		});
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
	r.table("users")
		.filter({name: user.name})
		.update({credit: user.credit, lastchanged: r.now()})
		.run(connection, function(err){
			if(err)
				winston.log('error', "Couldn't save transaction for user " + user.name + err);
		});

      if(delta < 0)
         sock.emit('ka-ching', JSON.stringify(users));
      else
         sock.emit('one-up', JSON.stringify(users));
	winston.log('info', '[userCredit] Changed credit from user ' + user.name + ' by ' + delta + '. New credit: ' + user.credit);
}

function criticalError(errormsg){
	winston.log('error', errormsg);
	process.exit(1);
}

process.on('SIGTERM', function() {
	winston.log('info', 'Server shutting down. Good bye!');
	process.exit();
});
