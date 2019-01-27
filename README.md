# fnordcredit [![Greenkeeper badge](https://badges.greenkeeper.io/fnordcredit/fnordcredit.svg)](https://greenkeeper.io/) [![Travis badge](https://travis-ci.org/fnordcredit/fnordcredit.svg?branch=master)](https://travis-ci.org/silsha/fnordcredit)
Open source credit system

Innovative, easy to use credit system for multiple users that comes with an intuitive design: Create an account and charge or discharge your credit.

## Development
fnordcredit is written in Javascript/Node.js/react/knex.

To start a local development server do the following:

```sh
git clone git@github.com:silsha/fnordcredit.git
cd fnordcredit
yarn
cp .env.example .env
yarn newDatabase
yarn build
  
# Don’t forget to build the frontend
cd fnordcredit-frontend
yarn
yarn build
cd ..
```

As last step, start the local development server using ```yarn start``` and visit http://localhost:8000
