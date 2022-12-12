'use strict';

const express = require('express');
const dataModules = require('../models');
const { users } = require('../models');
const bearerAuth = require('../auth/middleware/bearer');
const permissions = require('../auth/middleware/acl');

const bankRouter = express.Router();

bankRouter.param('model', (req, res, next) => {
  const modelName = req.params.model;
  // console.log('modelName', modelName);
  // console.log('req.params', req.params);
  if (dataModules[modelName]) {
    req.model = dataModules[modelName];
    console.log('req.model.model inside param function', req.model.model);
    if (req.model.model) {
      req.model = req.model.model;
    }
    // console.log('req.model inside param function', req.model);
    next();
  } else {
    next('Invalid Model');
  }
});

const userGetOne = async (req, res, next) => {
  try {
    let oneRecord;
    if (req.params.id) {
      oneRecord = await users.findOne({
        where: { id: req.params.id },
        includes: users,
      });
    }
    if (oneRecord.id !== req.user.id) {
      next('Access Denied: Invalid User Account');
    } else {
      return res.status(200).json(oneRecord);
    }
  } catch (e) {
    next('Get User Route Error', e);
  }
};

const adminGetAllOrOne = async (req, res, next) => {
  try {
    let allRecords;
    let oneRecord;
    if (!req.params.id) {
      allRecords = await users.findAll({});
    } else if (req.params.id) {
      oneRecord = await users.findOne({
        where: { id: req.params.id },
        includes: users,
      });
    }
    if (oneRecord) {
      return res.status(200).json(oneRecord);
    } else if (allRecords) {
      return res.status(200).json(allRecords);
    }
  } catch (e) {
    next('Get All Users Route Error', e);
  }
};

// async function handleCreate(req, res) {
//   let obj = req.body;
//   let newRecord = await req.model.create(obj);
//   res.status(201).json(newRecord);
// }

const userUpdateBalance = async (req, res, next) => {
  let id = req.params.id;
  let obj = req.body;
  // console.log('object data', obj);
  // console.log('amount', obj.amount);
  try {
    const user = await users.findOne({ where: { id: id } });
    // use updateBalance method from user model to update balance and then update the record
    let updatedRecord = await req.model.updateBalance(user, obj.amount);
    // determine previous balance
    let previousBalance;
    if (req.params.model === 'withdrawal') {
      previousBalance = updatedRecord.balance + obj.amount;
    } else if (req.params.model === 'deposit') {
      previousBalance = updatedRecord.balance - obj.amount;
    }
    let output;
    if (updatedRecord === 'Error: Insufficient Funds') {
      output = updatedRecord;
      return res.status(422).json(output);
    } else if (updatedRecord) {
      output = {
        username: user.username,
        role: user.role,
        accountNumber: user.accountNumber,
        accountType: user.accountType,
        updatedBalance: updatedRecord.balance,
        previousBalance: previousBalance,
        typeOfTransaction: obj.typeof,
        updatedAt: updatedRecord.updatedAt,
      };
    }
    // console.log('updated record', updatedRecord);
    // console.log('output', output);
    // res.status(200).json(updatedRecord);
    res.status(200).json(output);
  } catch (e) {
    next('Update User Route Error', e);
  }
};

const userDelete = async (req, res) => {
  let id = req.params.id;
  let record = await users.findOne({ where: { id: id } });
  // console.log('record', record);
  await req.model.destroy({ where: { id } });
  res.status(204).send(`Deleted ${record.username}::${record.role}::${record.accountNumber} from the database.`);
};

bankRouter.get('/:model', bearerAuth, permissions('update'), adminGetAllOrOne);
bankRouter.get('/:model/:id', bearerAuth, permissions('update'), adminGetAllOrOne);
bankRouter.get('/:model/myaccount/:id', bearerAuth, permissions('read'), userGetOne);
// bankRouter.post('/:model', bearerAuth, permissions('create'), handleCreate);
bankRouter.put('/:model/:id', bearerAuth, permissions('update'), userUpdateBalance);
bankRouter.delete('/:model/:id', bearerAuth, permissions('delete'), userDelete);

module.exports = bankRouter;
