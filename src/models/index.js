'use strict';

const { Sequelize, DataTypes } = require('sequelize');

const userModel = require('./users/users.schema');
const depositModel = require('./deposit/deposit.schema');
const withdrawalModel = require('./withdrawal/withdrawal.schema');
const DataInterface = require('./interface');

const DATABASE_URL = process.env.DATABASE_URL || 'sqlite:memory:';

const sequelize = new Sequelize(DATABASE_URL);
const deposit = depositModel(sequelize, DataTypes);
const withdrawal = withdrawalModel(sequelize, DataTypes);

module.exports = {
  db: sequelize,
  deposit: new DataInterface(deposit),
  withdrawal: new DataInterface(withdrawal),
  users: userModel(sequelize, DataTypes),
};
