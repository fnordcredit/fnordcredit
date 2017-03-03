// @flow
import bodyParser from 'body-parser';
import express from 'express';

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use('/', express.static(`${__dirname}/../static`));
app.use(bodyParser());

export default app;
