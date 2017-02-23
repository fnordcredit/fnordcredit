// @flow
require('./databaseInit');
const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const passwordHash = require('password-hash');
const config = require('../config');

let mqttclient;
if (config.mqtt.enable) {
  const mqtt = require('mqtt');
  mqttclient = mqtt.connect({
    host: config.mqtt.host,
    port: config.mqtt.port,
    username: config.mqtt.username,
    password: config.mqtt.password,
  });
}

const app = express();
let io;

let sock = {
  // eslint-disable-next-line
  emit() {},
};

process.stdin.resume();
winston.add(winston.transports.File, { filename: 'credit.log', json: false });
let users;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use('/', express.static(`${__dirname}/static`));
app.use(bodyParser());

function serverStart() {
  let server = require('http').createServer(app);
  io = require('socket.io').listen(server);

  io.sockets.on('connection', socket => {
    sock = socket;

    getAllUsersAsync((err, data) => {
      if (err) {
        return;
      }

      socket.emit('accounts', JSON.stringify(data));
    });

    getAllProductsAsync((err, data) => {
      if (err) {
        return;
      }

      socket.emit('products', JSON.stringify(data));
    });

    socket.on('getProducts', data => {
      getAllProductsAsync((err, data) => {
        if (err) {
          return;
        }

        socket.emit('products', JSON.stringify(data));
      });
    });

    socket.on('getAccounts', data => {
      getAllUsersAsync((err, data) => {
        if (err) {
          return;
        }

        socket.emit('accounts', JSON.stringify(data));
      });
    });
  });

  server = server.listen(8000, undefined, undefined, () => {
    winston.info('Server started!');

    setInterval(
      () => {
        if (sock.broadcast) {
          getAllUsersAsync((err, users) => {
            if (err) {
              return;
              // return res.send(500, 'Error retrieving users from database');
            }
            (sock: any).broadcast.emit('accounts', JSON.stringify(users));
          });

          sock.broadcast.emit('accounts', JSON.stringify(users));
        }
      },
      10 * 1000
    );
  });
}

app.get('/users/all', (req, res) => {
  getAllUsersAsync((err, users) => {
    if (err) {
      return res.send(500, 'Can\'t retrieve users from database');
    }

    res.send(JSON.stringify(users));
  });
});

app.get('/user/:username', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');

  const username = req.params.username;
  const pincode = req.header('X-User-Pincode');

  checkUserPin(
    username,
    pincode,
    () => {
      getUserAsync(username, (err, user) => {
        if (err) {
          return res.send(
            500,
            `Error retrieving user ${username} from database`
          );
        }

        const newname = req.body.newname;

        if (user == null) {
          res.send(404, 'User not found');
          winston.error(`[userCredit] No user ${username} found.`);
          return;
        }

        return res.send(JSON.stringify(user));
      });
    },
    () => res.send(401, 'Authorization required')
  );
});

app.get('/transactions/all', (req, res) => {
  getAllTransactionsAsync((err, data) => {
    if (err) {
      return res.send(500, 'Can\'t retrieve transactions from database');
    }

    res.send(200, JSON.stringify(data));
  });
});

app.get('/transactions/:username', (req, res) => {
  const username = req.params.username;
  const pincode = req.header('X-User-Pincode');

  checkUserPin(
    username,
    pincode,
    () => {
      getUserTransactionsAsync(username, (err, data) => {
        if (err) {
          return res.send(500, `Error retrieving transactions for ${username}`);
        }

        return res.send(JSON.stringify(data));
      });
    },
    () => res.send(401, 'Authorization required')
  );
});

app.post('/user/add', (req, res) => {
  addUser(req.body.username, res);
});

app.post('/user/rename', (req, res) => {
  const username = req.body.username;
  const pincode = req.header('X-User-Pincode');

  checkUserPin(
    username,
    pincode,
    () => {
      getUserAsync(username, (err, user) => {
        if (err) {
          return res.send(
            500,
            `Error retrieving user ${username} from database`
          );
        }

        const newname = req.body.newname;

        if (user == null) {
          res.send(404, 'User not found');
          winston.error(`[userCredit] No user ${username} found.`);
          return;
        }

        renameUser(user, newname, pincode, res);

        getAllUsersAsync((err, users) => {
          if (err) {
            return res.send(500, 'Error retrieving users from database');
          }

          sock.broadcast.emit('accounts', JSON.stringify(users));
          sock.emit('accounts', JSON.stringify(users));

          res.send(200, JSON.stringify(user));
        });
      });
    },
    () => res.send(401, 'Authorization required')
  );
});

app.post('/user/credit', (req, res) => {
  const username = req.body.username;
  const pincode = req.header('X-User-Pincode');
  const product = req.body.product || null;
  const description = req.body.description || null;

  checkUserPin(
    username,
    pincode,
    () => {
      getFullUserAsync(username, (err, user) => {
        if (err) {
          winston.error('[userCredit] database error while retrieving user');
          return res.send(500, `Error retrieving ${username} from database `);
        }

        const delta = parseFloat(req.body.delta);

        if (user == null) {
          res.send(404, 'User not found');
          winston.error(`[userCredit] No user ${username} found.`);
          return;
        }
        if (isNaN(delta) || delta >= 100 || delta <= -100) {
          res.send(406);
          winston.error('[userCredit] delta must be a number.');
          return;
        }

        if (delta < 0 && user.credit + delta < 0) {
          if (!config.settings.allowDebt) {
            res.send(406, 'negative credit not allowed in configuration.');
            winston.error(
              '[userCredit] negative credit not allowed in configuration'
            );
            return;
          }

          if (!user.debtAllowed) {
            res.send(406, 'negative credit not allowed for user');
            winston.error(
              `[userCredit] negative credit not allowed for user ${user.name} - (debtAllowed: ${user.debtAllowed})`
            );
            return;
          }

          if (user.credit + delta < config.settings.maxDebt) {
            res.send(
              406,
              `credit below ${config.settings.maxDebt} € not allowed in configuration.`
            );
            winston.error(
              '[userCredit] credit below maxDebt not allowed in configuration'
            );
            return;
          }

          if (user.credit + delta < user.debtHardLimit) {
            res.send(
              406,
              `credit below ${user.debtHardLimit} € not allowed for this user`
            );
            winston.error(
              `[userCredit] credit below ${user.debtHardLimit} for user ${user.name} not allowed`
            );
            return;
          }
        }
        updateCredit(user, delta, description, product);

        getAllUsersAsync((err, users) => {
          if (err) {
            return res.send(500, 'Error retrieving users from database');
          }

          sock.broadcast.emit('accounts', JSON.stringify(users));
          sock.emit('accounts', JSON.stringify(users));

          res.send(200, JSON.stringify(user));
        });
      });
    },
    () => res.send(401, 'Authorization required')
  );
});

app.post('/user/change-pin', (req, res) => {
  const username = req.body.username;
  const pincode = req.header('X-User-Pincode');
  let newPincode = req.body.pincode;

  checkUserPin(
    username,
    pincode,
    () => {
      getUserAsync(username, (err, user) => {
        if (err) {
          winston.error('[userCredit] database error while retrieving user');
          return res.send(500, `Error retrieving ${username} from database `);
        }

        if (user == null) {
          res.send(404, 'User not found');
          winston.error(`[userCredit] No user ${username} found.`);
          return;
        }

        newPincode = newPincode || null;

        updatePin(user.name, newPincode, err => {
          winston.error(err);
          if (err) {
            return res.send(500, 'Error updating PIN');
          }

          res.send(200, 'PIN updated successfully');
        });
      });
    },
    () => res.send(401, 'Authorization required')
  );
});

app.post('/user/change-token', (req, res) => {
  const username = req.body.username;
  const pincode = req.header('X-User-Pincode');
  let newToken = req.body.newtoken;

  checkUserPin(
    username,
    pincode,
    () => {
      getUserAsync(username, (err, user) => {
        if (err) {
          winston.error('[userCredit] database error while retrieving user');
          return res.send(500, `Error retrieving ${username} from database `);
        }

        if (user == null) {
          res.send(404, 'User not found');
          winston.error(`[userCredit] No user ${username} found.`);
          return;
        }

        newToken = newToken || null;

        updateToken(user.name, newToken, err => {
          winston.error(err);
          if (err) {
            return res.send(500, 'Error updating token');
          }

          res.send(200, 'Tokens updated successfully');
        });
      });
    },
    () => res.send(401, 'Authorization required')
  );
});

app.get('/products', (req, res) => {
  getAllProductsAsync((err, data) => {
    res.send(200, JSON.stringify(data));
  });
});

app.get('/token/:token', (req, res) => {
  const token = req.params.token;

  getUserByTokenAsync(token, (err, user) => {
    if (user == null) {
      res.send(404, 'User not found');
      winston.error(`[userCredit] No user for token ${token} found.`);
      return;
    }

    return res.send(JSON.stringify(user));
  });
});

function checkUserPin(username, pincode, cbOk, cbFail) {
  r.table('users').get(username).run(connection, (err, user) => {
    if (err || user == null) {
      winston.error(`Could'nt check PIN for user ${username}`);
      cbFail();
      return;
    }

    const dbPin = user.pincode;
    const dbToken = user.token;

    if (
      dbPin == null ||
      passwordHash.verify(pincode, dbPin) ||
      (dbToken != null && dbToken === pincode)
    ) {
      cbOk();
    } else {
      cbFail();
    }
  });
}

function updatePin(username, newPincode, cb) {
  let hashedPincode = null;

  if (newPincode) {
    hashedPincode = passwordHash.generate(newPincode);
  }

  r
    .table('users')
    .get(username)
    .update({ pincode: hashedPincode })
    .run(connection, cb);
}

function updateToken(username, newToken, cb) {
  r.table('users').get(username).update({ token: newToken }).run(connection, cb);
}

function getUserAsync(username, cb) {
  r
    .table('users')
    .get(username)
    .pluck('name', 'lastchanged', 'credit')
    .run(connection, cb);
}

function getFullUserAsync(username, cb) {
  r.table('users').get(username).run(connection, cb);
}

function getUserByTokenAsync(token, cb) {
  r
    .table('users')
    .filter({ token })
    .pluck('name', 'lastchanged', 'credit')
    .run(connection, (err, cursor) => {
      cursor.next((err, row) => {
        if (err) {
          return cb(err, null);
        }

        return cb(err, row);
      });
    });
}

function getAllUsersAsync(cb) {
  r.table('users').pluck('name', 'lastchanged', 'credit').run(connection, (
    err,
    table
  ) => {
    if (err) {
      return cb(err, null);
    }

    table.toArray(cb);
  });
}

function getUserTransactionsAsync(username, cb) {
  r
    .table('transactions')
    .filter(r.row('username').eq(username))
    .run(connection, (err, cursor) => {
      if (err) {
        return cb(err, null);
      }

      cursor.toArray(cb);
    });
}

function getAllTransactionsAsync(cb) {
  r.table('transactions').run(connection, (err, table) => {
    if (err) {
      return cb(err, null);
    }

    table.toArray(cb);
  });
}

function getAllProductsAsync(cb) {
  r.table('products').orderBy('order').run(connection, (err, table) => {
    if (err) {
      return cb(err, null);
    }

    table.toArray(cb);
  });
}

function addUser(username, res) {
  r
    .table('users')
    .insert({
      name: username,
      credit: 0,
      lastchanged: r.now(),
      pincode: null,
    })
    .run(connection, (err, dbres) => {
      if (dbres.errors) {
        winston.error(`Couldn't save user ${username}${err}`);
        res.send(409, 'User exists already.');
      } else {
        getAllUsersAsync((err, users) => {
          if (err) {
            return res.send(500, 'Error retrieving users from database');
          }

          sock.broadcast.emit('accounts', JSON.stringify(users));
          sock.emit('accounts', JSON.stringify(users));

          res.send(200);
          winston.info(`[addUser] New user ${username} created`);
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

  r
    .table('users')
    .insert({
      name: newname,
      credit: user.credit,
      lastchanged: r.now(),
      pincode,
    })
    .run(connection, (err, dbres) => {
      if (dbres.errors) {
        winston.error(`Couldn't save user ${newname}`);
        res.send(409, 'That username is already taken');
      } else {
        r
          .table('users')
          .filter({ name: user.name })
          .delete()
          .run(connection, err => {
            if (err) {
              winston.error(`Couldn't delete old user ${user.name}`);
              res.send(409, 'Can\'t delete old user');
            }
          });
        r
          .table('transactions')
          .filter({ username: user.name })
          .update({ username: newname })
          .run(connection, err => {
            if (err) {
              winston.error(
                `Couldn't update transactions of old user ${user.name}`
              );
              res.send(409, 'Can\'t update transactions!');
            }
          });
      }
    });
}

function updateCredit(user, delta, description, product) {
  description = description || null;
  product = product || null;

  user.credit += Number(delta);
  user.credit = Math.round(user.credit * 100) / 100;
  user.lastchanged = Date.now();

  const transaction = {
    username: user.name,
    delta,
    credit: user.credit,
    time: r.now(),
    description,
    product,
  };

  r.table('transactions').insert(transaction).run(connection, err => {
    if (err) {
      winston.error(`Couldn't save transaction for user ${user.name}${err}`);
    }

    if (config.mqtt.enable) {
      mqttPost('transactions', transaction);
    }
  });
  r
    .table('users')
    .filter({ name: user.name })
    .update({ credit: user.credit, lastchanged: r.now() })
    .run(connection, err => {
      if (err) {
        winston.error(`Couldn't save transaction for user ${user.name}${err}`);
      }
    });

  if (delta < 0) {
    sock.emit('ka-ching', JSON.stringify(users));
  } else {
    sock.emit('one-up', JSON.stringify(users));
  }

  winston.info(
    `[userCredit] Changed credit from user ${user.name} by ${delta}. New credit: ${user.credit}`
  );
}

function mqttPost(service, payload) {
  mqttclient.publish(
    `${config.mqtt.prefix}/${service}`,
    JSON.stringify(payload),
    {},
    err => {}
  );
}

function criticalError(errormsg) {
  winston.error(errormsg);
  process.exit(1);
}

process.on('SIGTERM', () => {
  winston.info('Server shutting down. Good bye!');
  process.exit();
});

module.exports = {
  addUser,
  serverStart,
  connection,
};
