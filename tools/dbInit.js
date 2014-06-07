var config = require('../config');
var q = require("q");
var r = require("rethinkdb");
var connection = null;

q.nfcall(r.connect, {host: config.rethinkdb.host, port: config.rethinkdb.port, db: config.rethinkdb.db})
.then(function(con){
    connection=con;
    console.log("message", "connected")
    return q.nsend(r.dbList(), "run", connection);//ninvoke
})
.then(function(dbs){
    if(dbs.indexOf(config.rethinkdb.db) == -1){
        console.log("creating db")
        return q.nsend(r.dbCreate(config.rethinkdb.db), "run", connection)
                .then(function(){console.log("db created")})
    }else{
        console.log("db exists");
    }
})
.then(function(){
    return q.nsend(r.db(config.rethinkdb.db).tableList(), "run", connection);//ninvoke
})
.then(function(tables){
    var promises = [];
    if(tables.indexOf("users") == -1){
        console.log("creating user table")
        promises.push(q.nsend(r.db(config.rethinkdb.db).tableCreate('users', {primaryKey: "name"}), "run", connection)
                .then(function(){console.log("users table created")}))
    }else{
        console.log("users table exists");
    }

    if(tables.indexOf("transactions") == -1){
        console.log("creating transactions table")
        promises.push(q.nsend(r.db(config.rethinkdb.db).tableCreate('transactions'), "run", connection)
                .then(function(){console.log("transactions table created")}))
    }else{
        console.log("transactions table exists");
    }

    return q.all(promises)
})
.then(function(){
        console.log("message", "db initialized, you can run fnordcredit now");
        process.exit(0);
    },
    function(error){
        console.error(error.message);
        process.exit(1);
    })
.done();