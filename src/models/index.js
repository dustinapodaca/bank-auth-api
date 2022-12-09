'use strict';

const { Sequelize, DataTypes } = require('sequelize');

const userModel = require('./users/users');
const depositModel = require('./deposit/deposit');
const withdrawalModel = require('./withdrawal/withdrawal');
const modelInterface = require('./interface');

const DATABASE_URL = process.env.DATABASE_URL || 'sqlite:memory:';

const sequelize = new Sequelize(DATABASE_URL);
const deposit = depositModel(sequelize, DataTypes);
const withdrawal = withdrawalModel(sequelize, DataTypes);

module.exports = {
  db: sequelize,
  deposit: new modelInterface(deposit),
  withdrawal: new modelInterface(withdrawal),
  users: userModel(sequelize, DataTypes),
};
