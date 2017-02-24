// @flow
import './databaseInit';
import { addUser, getAllUsers } from './Service/UserService';
import bodyParser from 'body-parser';
import config from '../config';
import express from 'express';
import passwordHash from 'password-hash';
import TransactionModel from './Model/TransactionModel';
import UserModel from './Model/UserModel';
import uuid from 'uuid';
import winston from 'winston';

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

let sock: any = {
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
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

app.use('/', express.static(`${__dirname}/../static`));
app.use(bodyParser());

function serverStart() {
  let server = require('http').createServer(app);
  io = require('socket.io').listen(server);

  io.sockets.on('connection', socket => {
    sock = socket;

    getAllUsers().then((data) => socket.emit('accounts', JSON.stringify(data)));

    socket.on('getAccounts', () => {
      getAllUsers().then((data) => socket.emit('accounts', JSON.stringify(data)));
    });
  });

  server = server.listen(8000, undefined, undefined, () => {
    winston.info('Server started!');

    setInterval(
      () => {
        if (sock.broadcast) {
          getAllUsers().then(users => sock.broadcast.emit('accounts', JSON.stringify(users)));


          sock.broadcast.emit('accounts', JSON.stringify(users));
        }
      },
      10 * 1000,
    );
  });
}

app.get('/users/all', (req, res) => {
  getAllUsers().then(users => res.send(JSON.stringify(users)));
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
            `Error retrieving user ${username} from database`,
          );
        }

        // const newname = req.body.newname;

        if (user == null) {
          res.send(404, 'User not found');
          winston.error(`[userCredit] No user ${username} found.`);
          return;
        }

        return res.send(JSON.stringify(user));
      });
    },
    () => res.send(401, 'Authorization required'),
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
    () => res.send(401, 'Authorization required'),
  );
});

app.post('/user/add', async (req, res) => {
  try {
    await addUser(req.body.username);
  } catch (e) {
    res.send(500, e.message);
    return;
  }
  const users = await getAllUsers();
  if (sock.broadcast) {
    sock.broadcast.emit('accounts', JSON.stringify(users));
  }
  sock.emit('accounts', JSON.stringify(users));
  res.send(200);
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
            `Error retrieving user ${username} from database`,
          );
        }

        const newname = req.body.newname;

        if (user == null) {
          res.send(404, 'User not found');
          winston.error(`[userCredit] No user ${username} found.`);
          return;
        }

        renameUser(user, newname, pincode, res);

        getAllUsers().then(users => {
          sock.broadcast.emit('accounts', JSON.stringify(users));
          sock.emit('accounts', JSON.stringify(users));

          res.send(200, JSON.stringify(user));
        });
      });
    },
    () => res.send(401, 'Authorization required'),
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
              '[userCredit] negative credit not allowed in configuration',
            );
            return;
          }

          if (!user.debtAllowed) {
            res.send(406, 'negative credit not allowed for user');
            winston.error(
              `[userCredit] negative credit not allowed for user ${user.name} - (debtAllowed: ${user.debtAllowed ? 'true' : 'false'})`,
            );
            return;
          }

          if (user.credit + delta < config.settings.maxDebt) {
            res.send(
              406,
              `credit below ${config.settings.maxDebt} € not allowed in configuration.`,
            );
            winston.error(
              '[userCredit] credit below maxDebt not allowed in configuration',
            );
            return;
          }

          if (user.debtHardLimit && user.credit + delta < user.debtHardLimit) {
            res.send(
              406,
              `credit below ${user.debtHardLimit} € not allowed for this user`,
            );
            winston.error(
              `[userCredit] credit below ${user.debtHardLimit || ''} for user ${user.name} not allowed`,
            );
            return;
          }
        }
        updateCredit(user, delta, description, product);

        getAllUsers().then(users => {
          if (sock.broadcast) {
            sock.broadcast.emit('accounts', JSON.stringify(users));
          }
          sock.emit('accounts', JSON.stringify(users));

          res.send(200, JSON.stringify(user));
        });
      });
    },
    () => res.send(401, 'Authorization required'),
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
    () => res.send(401, 'Authorization required'),
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
    () => res.send(401, 'Authorization required'),
  );
});

// app.get('/products', (req, res) => {
//   getAllProductsAsync((err, data) => {
//     res.send(200, JSON.stringify(data));
//   });
// });

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

async function checkUserPin(username, pincode, cbOk, cbFail) {
  const user = await UserModel.where({ name: username }).fetch();
  if (!user) {
    winston.error(`Could'nt check PIN for user ${username}`);
    cbFail();
    return;
  }

  const dbPin = user.get('pincode');
  const dbToken = user.get('token');

  if (
    dbPin == null ||
    passwordHash.verify(pincode, dbPin) ||
    (dbToken != null && dbToken === pincode)
  ) {
    cbOk();
  } else {
    cbFail();
  }
}

async function updatePin(username, newPincode, cb) {
  let hashedPincode = null;

  if (newPincode) {
    hashedPincode = passwordHash.generate(newPincode);
  }

  try {
    await UserModel.where({ name: username }).save({ pincode: hashedPincode });
    cb();
  } catch (e) {
    cb(e);
  }
}

async function updateToken(username, newToken, cb) {
  try {
    await UserModel.where({ name: username }).save({ token: newToken });
    cb();
  } catch (e) {
    cb(e);
  }
}

async function getUserAsync(username, cb) {
  const user = await UserModel.where({ name: username }).fetch({ columns: ['name', 'lastchanged', 'credit'] });
  if (user) {
    cb(undefined, user.serialize());
  } else {
    cb(new Error());
  }
}

async function getFullUserAsync(username, cb) {
  const user = await UserModel.where({ name: username }).fetch();
  if (user) {
    cb(undefined, user.serialize());
  } else {
    cb(new Error());
  }
}

async function getUserByTokenAsync(token, cb) {
  const user = await UserModel.where({ token }).fetch({ columns: ['name', 'lastchanged', 'credit'] });
  if (user) {
    cb(undefined, user.serialize());
  } else {
    cb(new Error());
  }
}

async function getUserTransactionsAsync(username, cb) {
  const transactions = await TransactionModel.where({
    username,
  }).fetchAll();
  cb(undefined, transactions.serialize());
}

async function getAllTransactionsAsync(cb) {
  const transactions = await TransactionModel.fetchAll();
  cb(undefined, transactions.serialize());
}

// function getAllProductsAsync(cb) {
//   r.table('products').orderBy('order').run(connection, (err, table) => {
//     if (err) {
//       return cb(err, null);
//     }
//
//     table.toArray(cb);
//   });
// }


async function renameUser(user, newname, rawPincode, res) {
  let pincode;
  if (rawPincode) {
    pincode = passwordHash.generate(rawPincode);
  }
  const credit = user.credit;

  try {
    await new UserModel({
      name: newname,
      credit,
      lastchanged: new Date(),
      pincode,
    }).save();
  } catch (e) {
    winston.error(`Couldn't save user ${newname}`);
    res.send(409, 'That username is already taken');
  }

  await UserModel.where({ name: user.name }).destroy();
  const transactions = await TransactionModel.where({ username: user.name }).fetchAll();
  await Promise.all(transactions.map(t => t.save({ name: newname })));
}

async function updateCredit(user, delta, description) {
  user.credit += Number(delta);
  user.credit = Math.round(user.credit * 100) / 100;
  user.lastchanged = new Date();



  const transaction = new TransactionModel({
    id: uuid.v4(),
    username: user.name,
    delta,
    credit: user.credit,
    time: new Date(),
    description,
  });
  await transaction.save({}, { method: 'insert' });
  if (config.mqtt.enable) {
    mqttPost('transactions', transaction.serialize());
  }

  const dbUser = await UserModel.where({ name: user.name }).fetch();
  if (!dbUser) {
    winston.error(`Couldn't save transaction for user ${user.name}`);
    return;
  }
  await dbUser.save({ credit: user.credit, lastchanged: new Date() });


  if (delta < 0) {
    sock.emit('ka-ching', JSON.stringify(users));
  } else {
    sock.emit('one-up', JSON.stringify(users));
  }

  winston.info(
    `[userCredit] Changed credit from user ${user.name} by ${delta}. New credit: ${user.credit}`,
  );
}

function mqttPost(service, payload) {
  mqttclient.publish(
    `${config.mqtt.prefix}/${service}`,
    JSON.stringify(payload),
    {},
    // eslint-disable-next-line
    err => {},
  );
}

// eslint-disable-next-line
function criticalError(errormsg) {
  winston.error(errormsg);
  process.exit(1);
}

process.on('SIGTERM', () => {
  winston.info('Server shutting down. Good bye!');
  process.exit();
});

serverStart();

module.exports = {
  addUser,
  serverStart,
};
