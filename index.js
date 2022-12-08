'use strict';

require('dotenv').config();
const app = require('./src/server');
const { db } = require('./src/models');

const PORT = process.env.PORT || 3004;

const start = async () => {
  try {
    await db.sync();
    app.start(PORT);
  } catch (e) {
    console.error('Could not start server', e.message);
  }
};

start();
