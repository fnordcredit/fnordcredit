var express = require('express');
var bodyParser = require('body-parser');
var winston = require('winston');
var r = require('rethinkdb');
var config = require('./config');

if (config.mqtt.enable) {
    var mqtt = require('mqtt');
    var mqttclient = mqtt.createClient(config.mqtt.port, config.mqtt.host);
}

var app = express();
var io;

var sock = {
    emit: function () {}
};

process.stdin.resume();
winston.add(winston.transports.File, { filename: 'credit.log', json: false });

var users;


var connection = null;
r.connect({host: config.rethinkdb.host, port: config.rethinkdb.port, db: config.rethinkdb.db}, function (err, conn) {
    if (err) {
        criticalError('Couldn\'t connect to RethinkDB.');
    }
    connection = conn;
    serverStart(connection);
});

app.use('/', express.static(__dirname + '/static'));
app.use(bodyParser());


function serverStart(connection) {
    server = require('http').createServer(app);
    io = require('socket.io').listen(server);

    io.sockets
        .on('connection', function (socket) {
            sock = socket;

            getAllUsersAsync(function (err, data) {
                if(err) {
                    return;
                }

                socket.emit('accounts', JSON.stringify(data));
            });

            socket.on('getAccounts', function (data) {
                getAllUsersAsync(function (err, data) {
                    if (err) {
                        return;
                    }

                    socket.emit('accounts', JSON.stringify(data));
                });
            });
        });

    var server = server.listen(8000, function () {
        winston.info('Server started!');
    });
}


app.get('/users/all', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    getAllUsersAsync(function (err, users) {

        if (err) {
            return res.send(500, 'Can\'t retrieve users from database');
        }

        res.send(JSON.stringify(users));
    });
});

app.get('/transactions/all', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    getAllTransactionsAsync(function (err, data) {
        if (err) {
           return res.send(500, 'Can\'t retrieve transactions from database');
        }

        res.send(200, JSON.stringify(data));
    });
});

app.get('/transactions/:username', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    getUserTransactionsAsync(req.params.username, function (err, data) {

        if (err) {
            return res.send(500, 'Error retrieving transactions for ' + req.params.username)
        }

        res.send(200, JSON.stringify(data));
    });
});

app.post('/user/add', function (req, res) {
    addUser(req.body.username, res);
});

app.post('/user/rename', function (req, res) {

    var username = req.body.username;

    getUserAsync(username, function (err, user) {

        if (err) {
            return res.send(500, 'Error retrieving user ' + username + ' from database');
        }

        var newname = req.body.newname;

        if (user == undefined) {
            res.send(404, 'User not found');
            winston.error('[userCredit] No user ' + username + ' found.')
            return;
        }

        renameUser(user, newname, res);

        getAllUsersAsync(function (err, users) {

            if (err) {
                return res.send(500, 'Error retrieving users from database');
            }

            sock.broadcast.emit('accounts', JSON.stringify(users));
            sock.emit('accounts', JSON.stringify(users));

            res.send(200, JSON.stringify(user));
        });

    })
});

app.post('/user/credit', function (req, res) {

    var username = req.body.username;

    getUserAsync(username, function (err, user) {

        if(err) {
            winston.error('[userCredit] database error while retrieving user');
            return res.send(500, 'Error retrieving ' + username + ' from database ');
        }

        var delta = parseFloat(req.body.delta);

        if (user == undefined) {
            res.send(404, 'User not found');
            winston.error('[userCredit] No user ' + username + ' found.')
            return;
        }
        if (isNaN(delta) || delta >= 100 || delta <= -100) {
            res.send(406);
            winston.error('[userCredit] delta must be a number.');
            return;
        }

        if (delta < 0 && (user.credit + delta) < 0) {
            if (config.settings.allowDebt == false) {
                res.send(406, 'negative credit not allowed in configuration.');
                winston.error('[userCredit] negative credit not allowed in configuration');
                return;
            }
            if ((user.credit + delta) < config.settings.maxDebt) {
                res.send(406, 'credit below ' + config.settings.maxDebt + '€ not allowed in configuration.');
                winston.error('[userCredit] credit below maxDebt not allowed in configuration');
                return;
            }
        }
        updateCredit(user, delta);

        getAllUsersAsync(function (err, users) {

            if (err) {
                return res.send(500, 'Error retrieving users from database');
            }

            sock.broadcast.emit('accounts', JSON.stringify(users));
            sock.emit('accounts', JSON.stringify(users));

            res.send(200, JSON.stringify(user));
        });

    })
});

function getUserAsync(username, cb) {
    r.table('users').get(username).run(connection, cb);
}

function getAllUsersAsync(cb) {

    r.table('users').run(connection, function (err, table) {

        if (err) {
            return cb(err, null);
        }
        
        table.toArray(cb);
    })
}

function getUserTransactionsAsync(username, cb) {
    r.table('transactions')
        .filter(r.row('username').eq(username))
        .run(connection, function (err, cursor) {

            if (err) {
                return cb(err, null);
            }

            cursor.toArray(cb);
        });
}

function getAllTransactionsAsync(cb) {
    r.table('transactions')
        .run(connection, function (err, table) {
            if (err) {
                return cb(err, null);
            }

            table.toArray(cb);
        });
}


function addUser(username, res) {
    r.table("users").insert({
        name: username,
        credit: 0,
        lastchanged: r.now()
    }).run(connection, function (err, dbres) {
        if (dbres.errors) {
            winston.error('Couldn\'t save user ' + username + err);
            res.send(409, "User exists already.");
        } else {
            getAllUsersAsync(function (err, users) {

                if (err) {
                    return res.send(500, 'Error retrieving users from database');
                }

                sock.broadcast.emit('accounts', JSON.stringify(users));
                sock.emit('accounts', JSON.stringify(users));

                res.send(200);
                winston.info('[addUser] New user ' + username + ' created');
                return true;
            });
        }
    });
}

function renameUser(user, newname, res) {
    r.table('users').insert({
        name: newname,
        credit: user.credit,
        lastchanged: r.now()
    }).run(connection, function (err, dbres) {
        if (dbres.errors) {
            winston.error('Couldn\'t save user ' + newname);
            res.send(409, 'That username is already taken');
        } else {
            r.table("users")
                .filter({name: user.name})
                .delete()
                .run(connection, function (err) {
                    if (err) {
                        winston.error('Couldn\'t delete old user ' + user.name);
                        res.send(409, 'Can\'t delete old user');
                    }
                });
            r.table("transactions")
                .filter({username: user.name})
                .update({username: newname})
                .run(connection, function (err) {
                    if (err) {
                        winston.error('Couldn\'t update transactions of old user ' + user.name);
                        res.send(409, 'Can\'t update transactions. Better call silsha!');
                    }
                });
        }
    });
}

function updateCredit(user, delta) {
    user.credit += +delta;
    user.credit = Math.round(user.credit * 100) / 100;
    user.lastchanged = Date.now();

    var transaction = {
        username: user.name,
        delta: delta,
        credit: user.credit,
        time: r.now()
    }

    r.table("transactions").insert(transaction).run(connection, function (err) {
        if (err) {
            winston.error('Couldn\'t save transaction for user ' + user.name + err);
        }

        if (config.mqtt.enable) {
            mqttPost('transactions', transaction);
        }
    });
    r.table("users")
        .filter({name: user.name})
        .update({credit: user.credit, lastchanged: r.now()})
        .run(connection, function (err) {
            if (err) {
                winston.error('Couldn\'t save transaction for user ' + user.name + err);
            }
        });

    if (delta < 0) {
        sock.emit('ka-ching', JSON.stringify(users));
    } else {
        sock.emit('one-up', JSON.stringify(users));
    }

    winston.info('[userCredit] Changed credit from user ' + user.name + ' by ' + delta + '. New credit: ' + user.credit);
}

function mqttPost(service, payload) {
    mqttclient.publish(config.mqtt.prefix + '/' + service, JSON.stringify(payload));
}

function criticalError(errormsg) {
    winston.error(errormsg);
    process.exit(1);
}

process.on('SIGTERM', function () {
    winston.info('Server shutting down. Good bye!');
    process.exit();
});
