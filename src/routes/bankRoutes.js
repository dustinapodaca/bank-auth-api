'use strict';

const express = require('express');
const dataModules = require('../models');
const { users } = require('../models');
const bearerAuth = require('../auth/middleware/bearer');
const permissions = require('../auth/middleware/acl');

const bankRouter = express.Router();

bankRouter.param('model', (req, res, next) => {
  const modelName = req.params.model;
  if (dataModules[modelName]) {
    req.model = dataModules[modelName];
    next();
  } else {
    next('Invalid Model');
  }
});

// async function handleGetOne(req, res) {
//   const id = req.params.id;
//   //include the user schema attached to the user id
//   const model = req.model;
//   let theRecord = await req.model.read(id, model);
//   res.status(200).json(theRecord);
// }

const handleGetOne = async (req, res, next) => {
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

async function handleCreate(req, res) {
  let obj = req.body;
  let newRecord = await req.model.create(obj);
  res.status(201).json(newRecord);
}

async function handleUpdate(req, res, next) {
  let id = req.params.id;
  console.log(id);
  let obj = req.body;
  console.log('object data', obj);
  try {
    let updatedRecord = await req.model.update(id, obj);
    console.log('updated record', updatedRecord);
    res.status(200).json(updatedRecord);
  } catch (e) {
    next('Update User Route Error', e);
  }
}

async function handleDelete(req, res) {
  let id = req.params.id;
  let deletedRecord = await req.model.delete(id);
  res.status(200).json(deletedRecord);
}

bankRouter.get('/:model/:id', bearerAuth, permissions('read'), handleGetOne);
// bankRouter.post('/:model', bearerAuth, permissions('create'), handleCreate);
bankRouter.put('/:model/:id', bearerAuth, permissions('update'), handleUpdate);
bankRouter.delete('/:model/:id', bearerAuth, permissions('delete'), handleDelete);

module.exports = bankRouter;
