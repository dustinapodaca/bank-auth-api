'use strict';

const express = require('express');
const dataModules = require('../models');
const { users } = require('../models');
const bearerAuth = require('../auth/middleware/bearer');
const permissions = require('../auth/middleware/acl');

const bankRouter = express.Router();

bankRouter.param('model', (req, res, next) => {
  const modelName = req.params.model;
  console.log('modelName', modelName);
  if (dataModules[modelName]) {
    req.model = dataModules[modelName];
    console.log('req.model.model inside param function', req.model.model);
    if (req.model.model) {
      req.model = req.model.model;
    }
    console.log('req.model inside param function', req.model);
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
    return res.status(200).json(oneRecord);
  } catch (e) {
    next('Get User Route Error', e);
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
  console.log('object data', obj);
  console.log('amount', obj.amount);
  try {
    const user = await users.findOne({ where: { id: id } });
    // use updateBalance method from user model to update balance and then update the record
    let updatedRecord = await req.model.updateBalance(user, obj.amount);
    console.log('updated record', updatedRecord);
    res.status(200).json(updatedRecord);
  } catch (e) {
    next('Update User Route Error', e);
  }
};

const userDelete = async (req, res) => {
  let id = req.params.id;
  let record = await users.findOne({ where: { id: id } });
  console.log('record', record);
  await req.model.destroy({ where: { id } });
  res.status(200).send(`Deleted ${record.username}::${record.role}::${record.accountNumber} from the database.`);
};

bankRouter.get('/:model/:id', bearerAuth, permissions('read'), userGetOne);
// bankRouter.post('/:model', bearerAuth, permissions('create'), handleCreate);
bankRouter.put('/:model/:id', bearerAuth, permissions('update'), userUpdateBalance);
bankRouter.delete('/:model/:id', bearerAuth, permissions('delete'), userDelete);

module.exports = bankRouter;
