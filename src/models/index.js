'use strict';

const { Sequelize, DataTypes } = require('sequelize');

const userModel = require('./users/users.schema');
const depositSchema = require('./deposit/deposit.schema');
const withdrawalSchema = require('./withdrawal/withdrawal.schema');
const DataInterface = require('./interface');

const DATABASE_URL = process.env.DATABASE_URL || 'sqlite:memory:';

const sequelize = new Sequelize(DATABASE_URL);
const DepositModel = depositSchema(sequelize, DataTypes);
const WithdrawalModel = withdrawalSchema(sequelize, DataTypes);

const UserModel = userModel(sequelize, DataTypes);

UserModel.hasMany(DepositModel, WithdrawalModel);
DepositModel.belongsTo(UserModel);
WithdrawalModel.belongsTo(UserModel);

module.exports = {
  db: sequelize,
  users: UserModel,
  deposit: new DataInterface(DepositModel),
  withdrawal: new DataInterface(WithdrawalModel),
};
