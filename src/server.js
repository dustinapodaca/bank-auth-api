'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./error-handlers/500');
const notFound = require('./error-handlers/404');
const logger = require('./middleware/logger');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const bankRoutes = require('./routes/bankRoutes');

const app = express();

app.use(cors());
app.use(logger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
app.use(authRoutes);
//http://localhost:3001/transaction/deposit : withdrawal : users
app.use('/transaction', bankRoutes);
app.get('/', (req, res) => {
  res.status(200).send('Hello, welcome to the Bank Server');
});

app.use('*', notFound);
app.use(errorHandler);

module.exports = {
  server: app,
  start: (PORT) => {
    app.listen(PORT, () => {
      console.log(`Server up on port: ${PORT}`);
    });
  },
};
