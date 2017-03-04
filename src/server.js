// @flow
import './databaseInit';
import {
  addUser,
  checkUserPin,
  getAllUsers,
  getUser,
  getUserByToken,
  getUserTransactions,
  renameUser,
  updateCredit,
} from './Service/UserService';
import app from './serverInit';
import TransactionModel from './Model/TransactionModel';
import winston from 'winston';
import type UserModel from './Model/UserModel';

const config = {
  debtAllowed: Boolean(process.env.ALLOW_DEBT),
  maxDebt: Number.parseInt(process.env.MAX_DEBT || '-100', 10) || -100,
};

let io;

let sock: any = {
  // eslint-disable-next-line
  emit() {}
};

process.stdin.resume();
winston.add(winston.transports.File, { filename: 'credit.log', json: false });
let users;

function serverStart() {
  let server = require('http').createServer(app);
  io = require('socket.io').listen(server);

  io.sockets.on('connection', socket => {
    sock = socket;

    getAllUsers().then(data => socket.emit('accounts', JSON.stringify(data)));

    socket.on('getAccounts', () => {
      getAllUsers().then(data => socket.emit('accounts', JSON.stringify(data)));
    });
  });

  server = server.listen(8000, undefined, undefined, () => {
    winston.info('Server started!');

    setInterval(
      () => {
        if (sock.broadcast) {
          getAllUsers().then(users =>
            sock.broadcast.emit('accounts', JSON.stringify(users)));

          sock.broadcast.emit('accounts', JSON.stringify(users));
        }
      },
      10 * 1000
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

  checkUserPin(username, pincode)
    .catch(() => res.send(401, 'Authorization required'))
    .then(() => getUser(username))
    // .catch(() => res.send(
    //   500,
    //   `Error retrieving user ${username} from database`
    // ))
    .then((user: UserModel) => res.send(JSON.stringify(user)));
});

app.get('/transactions/all', (req, res) => {
  TransactionModel.fetchAll().then(transactions => {
    res.send(200, JSON.stringify(transactions));
  });
});

app.get('/transactions/:username', (req, res) => {
  const username = req.params.username;
  const pincode = req.header('X-User-Pincode');

  checkUserPin(username, pincode)
    .catch(() => res.send(401, 'Authorization required'))
    .then(() => getUserTransactions(username))
    .then(transactions => {
      res.send(JSON.stringify(transactions));
    });
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

  checkUserPin(username, pincode)
    .catch(() => res.send(401, 'Authorization required'))
    .then(() => getUser(username))
    .catch(() =>
      res.send(500, `Error retrieving user ${username} from database`))
    .then(user => {
      const newname = req.body.newname;

      if (user == null) {
        res.send(404, 'User not found');
        winston.error(`[userCredit] No user ${username} found.`);
        return;
      }

      try {
        renameUser(user.serialize(), newname, pincode);
      } catch (e) {
        res.status(500).send(e.message);
      }

      getAllUsers().then(users => {
        sock.broadcast.emit('accounts', JSON.stringify(users));
        sock.emit('accounts', JSON.stringify(users));

        res.send(200, JSON.stringify(user));
      });
    });
});

app.post('/user/credit', (req, res) => {
  const username = req.body.username;
  const pincode = req.header('X-User-Pincode');
  const product = req.body.product || null;
  const description = req.body.description || null;

  checkUserPin(username, pincode)
    .catch(() => res.send(401, 'Authorization required'))
    .then(() => getUser(username))
    // .catch(() => {
    //   winston.error('[userCredit] database error while retrieving user');
    //   return res.send(500, `Error retrieving ${username} from database `);
    // })
    .then(dbUser => {
      const user = dbUser.serialize();
      const delta = parseFloat(req.body.delta);

      if (isNaN(delta) || delta >= 100 || delta <= -100) {
        res.send(406);
        winston.error('[userCredit] delta must be a number.');
        return;
      }

      if (delta < 0 && user.credit + delta < 0) {
        if (!config.debtAllowed) {
          res.send(406, 'negative credit not allowed in configuration.');
          winston.error(
            '[userCredit] negative credit not allowed in configuration'
          );
          return;
        }

        if (!user.debtAllowed) {
          res.send(406, 'negative credit not allowed for user');
          winston.error(
            `[userCredit] negative credit not allowed for user ${user.name} - (debtAllowed: ${user.debtAllowed ? 'true' : 'false'})`
          );
          return;
        }

        if (user.credit + delta < config.maxDebt) {
          res.send(
            406,
            `credit below ${config.maxDebt} € not allowed in configuration.`
          );
          winston.error(
            '[userCredit] credit below maxDebt not allowed in configuration'
          );
          return;
        }

        if (user.debtHardLimit && user.credit + delta < user.debtHardLimit) {
          res.send(
            406,
            `credit below ${user.debtHardLimit} € not allowed for this user`
          );
          winston.error(
            `[userCredit] credit below ${user.debtHardLimit || ''} for user ${user.name} not allowed`
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
});

// app.post('/user/change-pin', (req, res) => {
//   const username = req.body.username;
//   const pincode = req.header('X-User-Pincode');
//   let newPincode = req.body.pincode;
//
//   checkUserPin(username, pincode)
//     .catch(() => res.send(401, 'Authorization required'))
//     .then(() => getUser(username))
//     .catch(() => {
//       winston.error('[userCredit] database error while retrieving user');
//       return res.send(500, `Error retrieving ${username} from database `);
//     })
//     .then(async user => {
//       newPincode = newPincode || null;
//
//       try {
//         await updatePin(user.get('name'), newPincode);
//       } catch (e) {
//         res.send(500, e);
//       }
//       res.send(200, 'PIN updated successfully');
//     });
// });

// app.post('/user/change-token', (req, res) => {
//   const username = req.body.username;
//   const pincode = req.header('X-User-Pincode');
//   let newToken = req.body.newtoken;
//
//   checkUserPin(username, pincode)
//     .catch(() => res.send(401, 'Authorization required'))
//     .then(() => getUser(username))
//     .catch(() => {
//       winston.error('[userCredit] database error while retrieving user');
//       return res.send(500, `Error retrieving ${username} from database `);
//     })
//     .then(user => {
//       newToken = newToken || null;
//
//       updateToken(user.get('name'), newToken)
//         .catch(e => {
//           winston.error(e);
//           res.send(500, 'Error updating token');
//         })
//         .then(() => res.send(200, 'Tokens updated successfully'));
//     });
// });

// app.get('/products', (req, res) => {
//   getAllProductsAsync((err, data) => {
//     res.send(200, JSON.stringify(data));
//   });
// });

app.get('/token/:token', (req, res) => {
  const token = req.params.token;

  getUserByToken(token)
    .catch(() => {
      res.send(404, 'User not found');
      winston.error(`[userCredit] No user for token ${token} found.`);
    })
    .then(user => {
      res.send(JSON.stringify(user));
    });
});

process.on('SIGTERM', () => {
  winston.info('Server shutting down. Good bye!');
  process.exit();
});

serverStart();

module.exports = {
  addUser,
  serverStart,
};

if (process.argv.includes('--test', 2)) {
  process.exit(0);
}
