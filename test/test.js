var assert = require("assert")
var serverjs = require("../server.js");
var r = require('rethinkdb');
var config = require('../config');

var connection;

r.connect( {host: config.rethinkdb.host, port: config.rethinkdb.port, db: config.rethinkdb.db}, function(err, conn) {
	if (err) {process.exit(1);}
    connection = conn;
    serverStart(connection);
})

describe('User', function(){
	describe('create', function(){
		it('should create a new user', function(){
			serverjs.addUser("derp", null);
			r.table("users").get("derp").run(connection, function(err, res){
				assert.equal(res.name, "derp");
			})
		})
	})
})