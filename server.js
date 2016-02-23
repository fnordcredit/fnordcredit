var express = require('express');
var bodyParser = require('body-parser');
var winston = require('winston');
var passwordHash = require('password-hash');
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

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
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

            getAllProductsAsync(function (err, data){
                if (err) {
                    return;
                }

                socket.emit('products', JSON.stringify(data));
            });

            socket.on('getProducts', function(data) {
               getAllProductsAsync(function (err, data) {
                   if (err) {
                       return;
                   }

                   socket.emit('products', JSON.stringify(data));
               });
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

        setInterval(function() {
            if (sock.broadcast) {
                getAllUsersAsync(function (err, users) {
                    if (err) {
                        return res.send(500, 'Error retrieving users from database');
                    }
                    sock.broadcast.emit('accounts', JSON.stringify(users));
                });

                sock.broadcast.emit('accounts', JSON.stringify(users));
            }
        }, 10 * 1000);

    });
}


app.get('/users/all', function (req, res) {

    getAllUsersAsync(function (err, users) {

        if (err) {
            return res.send(500, 'Can\'t retrieve users from database');
        }

        res.send(JSON.stringify(users));
    });
});

app.get('/user/:username', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    var username = req.params.username;
    var pincode = req.header("X-User-Pincode");

    checkUserPin(username, pincode, function() {
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

            return res.send(JSON.stringify(user));
        });
    }, function () {
        return res.send(401, 'Authorization required')
    });
});

app.get('/transactions/all', function (req, res) {

    getAllTransactionsAsync(function (err, data) {
        if (err) {
           return res.send(500, 'Can\'t retrieve transactions from database');
        }

        res.send(200, JSON.stringify(data));
    });
});

app.get('/transactions/:username', function (req, res) {

    var username = req.params.username;
    var pincode = req.header("X-User-Pincode");

    checkUserPin(username, pincode, function() {
        getUserTransactionsAsync(username, function (err, data) {

            if (err) {
                return res.send(500, 'Error retrieving transactions for ' + username)
            }

            return res.send(JSON.stringify(data));
        });
    }, function() {
        return res.send(401, 'Authorization required');
    });
});

app.post('/user/add', function (req, res) {
    addUser(req.body.username, res);
});

app.post('/user/rename', function (req, res) {

    var username = req.body.username;
    var pincode = req.header("X-User-Pincode");

    checkUserPin(username, pincode, function() {
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

            renameUser(user, newname, pincode, res);

            getAllUsersAsync(function (err, users) {

                if (err) {
                    return res.send(500, 'Error retrieving users from database');
                }

                sock.broadcast.emit('accounts', JSON.stringify(users));
                sock.emit('accounts', JSON.stringify(users));

                res.send(200, JSON.stringify(user));
            });

        })
    }, function() {
        return res.send(401, 'Authorization required');
    });
});

app.post('/user/credit', function (req, res) {

    var username = req.body.username;
    var pincode = req.header("X-User-Pincode");
    var product = req.body.product || null;
    var description = req.body.description || null;

    checkUserPin(username, pincode, function() {
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

                if (!user.debtAllowed) {
                    res.send(406, 'negative credit not allowed for user');
                    winston.error('[userCredit] negative credit not allowed for user ' + user.name);
                    return;
                }

                if ((user.credit + delta) < config.settings.maxDebt) {
                    res.send(406, 'credit below ' + config.settings.maxDebt + ' € not allowed in configuration.');
                    winston.error('[userCredit] credit below maxDebt not allowed in configuration');
                    return;
                }

                if ((user.credit + delta) < user.debtHardLimit) {
                    res.send(406, 'credit below ' + user.debtHardLimit + ' € not allowed for this user');
                    winston.error('[userCredit] credit below ' + user.debtHardLimit + ' for user ' + user.name + ' not allowed');
                    return;
                }
            }
            updateCredit(user, delta, description, product);

            getAllUsersAsync(function (err, users) {

                if (err) {
                    return res.send(500, 'Error retrieving users from database');
                }

                sock.broadcast.emit('accounts', JSON.stringify(users));
                sock.emit('accounts', JSON.stringify(users));

                res.send(200, JSON.stringify(user));
            });

        })
    }, function() {
        return res.send(401, 'Authorization required');
    });
});

app.post('/user/change-pin', function (req, res) {

    var username = req.body.username;
    var pincode = req.header("X-User-Pincode");
    var newPincode = req.body.pincode;

    checkUserPin(username, pincode, function() {
        getUserAsync(username, function (err, user) {

            if(err) {
                winston.error('[userCredit] database error while retrieving user');
                return res.send(500, 'Error retrieving ' + username + ' from database ');
            }

            if (user == undefined) {
                res.send(404, 'User not found');
                winston.error('[userCredit] No user ' + username + ' found.')
                return;
            }

            newPincode = newPincode || null;

            updatePin(user.name, newPincode, function(err) {

                winston.error(err);
                if (err) {
                    return res.send(500, 'Error updating PIN');
                }

                res.send(200, 'PIN updated successfully');
            });

        })
    }, function() {
        return res.send(401, 'Authorization required');
    });
});


app.get('/products', function(req, res) {

    getAllProductsAsync(function (err, data) {
        res.send(200, JSON.stringify(data));
    });

});

app.get('/token/:token', function (req, res) {

    var token = req.params.token;

    getUserByTokenAsync(token, function(err, user) {

        if (user == null) {
            res.send(404, 'User not found');
            winston.error('[userCredit] No user for token ' + token + ' found.');
            return;
        }

        return res.send(JSON.stringify(user));
    });

});




function checkUserPin(username, pincode, cbOk, cbFail) {
    r.table('users').get(username).run(connection, function (err, user) {

        if (err || user == null) {
            winston.error('Could\'nt check PIN for user ' + username);
            cbFail();
            return;
        }

        dbPin = user.pincode;
        dbToken = user.token;

        if ( dbPin == undefined || dbPin == null || passwordHash.verify(pincode, dbPin) || (dbToken != undefined && dbToken != null && dbToken == pincode) ) {
            cbOk();
        } else {
            cbFail();
        }

    });
}

function updatePin(username, newPincode, cb) {

    newPincode = newPincode || null;
    var hashedPincode = null;

    if (newPincode != null) {
        hashedPincode = passwordHash.generate(newPincode);
    }

    winston.error("" + hashedPincode);
    r.table('users').get(username).update({pincode: hashedPincode}).run(connection, cb);
}

function getUserAsync(username, cb) {
    r.table('users').get(username).pluck("name", "lastchanged", "credit").run(connection, cb);
}

function getUserByTokenAsync(token, cb) {
    r.table('users').filter({"token": token}).pluck("name", "lastchanged", "credit").run(connection, function(err, cursor) {

        cursor.next(function (err, row) {
            if (err) return cb(err, null);

            return cb(err, row);
        });
    });
}

function getAllUsersAsync(cb) {

    r.table('users').pluck("name", "lastchanged", "credit").run(connection, function (err, table) {

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


function getAllProductsAsync(cb) {
    r.table('products').orderBy('order').run(connection, function (err, table) {
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
        lastchanged: r.now(),
        pincode: null
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

function renameUser(user, newname, pincode, res) {

    pincode = pincode || null;

    if (pincode != null) {
        pincode = passwordHash.generate(pincode);
    }

    r.table('users').insert({
        name: newname,
        credit: user.credit,
        lastchanged: r.now(),
        pincode: pincode
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
                        res.send(409, 'Can\'t update transactions!');
                    }
                });
        }
    });
}

function updateCredit(user, delta, description, product) {

    description = description || null;
    product = product || null;

    user.credit += +delta;
    user.credit = Math.round(user.credit * 100) / 100;
    user.lastchanged = Date.now();

    var transaction = {
        username: user.name,
        delta: delta,
        credit: user.credit,
        time: r.now(),
        description: description,
        product: product
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
