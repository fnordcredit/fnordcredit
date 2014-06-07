var fs = require('fs');
var r = require('rethinkdb');
var config = require('../config');

var insertCounter = 0;
var jsonCounter = 0;

var connection = null;
r.connect( {host: config.rethinkdb.host, port: config.rethinkdb.port, db: config.rethinkdb.db}, function(err, conn) {
    if (err) {criticalError("Couldn't connect to RethinkDB.");}
    connection = conn;
    migrationStart(connection);
})

function migrationStart(conn){
    fs.readFile('../database.json', 'utf-8', function(err, data){
        if(err) {criticalError("Couldn't find database.json. Maybe already migrated?");}
        json = JSON.parse(data)
        jsonCounter = Object.keys(json).length;
        for(user in json){
            var username = json[user].name;
            var credit = json[user].credit;
            var lastchanged = json[user].lastchanged;

            r.table("users").insert({
                name: username,
                credit: credit,
                lastchanged: new Date(lastchanged)
            }).run(conn, function(err, dbres){
                if(dbres.errors){
                    criticalError("Couldn't save user " + username + err);
                }else{
                    insertCounter++;
                    if(insertCounter == jsonCounter){
                        console.log('JSON files is migrated. Please start server.js now.');
                        process.exit();
                    }
                }
            });
        }
    })
}

function criticalError(errormsg){
    console.log(errormsg);
    process.exit(1);
}