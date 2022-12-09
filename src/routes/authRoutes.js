'use strict';

const express = require('express');
const basicAuth = require('../auth/middleware/basic');
const bearerAuth = require('../auth/middleware/bearer');
const permissions = require('../auth/middleware/acl');
const { users } = require('../models/index');

const authRouter = express.Router();

const userSignUp = async (req, res, next) => {
  try {
    let userRecord = await users.create(req.body);
    const output = {
      user: userRecord,
      token: userRecord.token,
      refreshToken: userRecord.refreshToken,
    };
    res.status(201).json(output);
    // res.cookie('refreshToken', userRecord.refreshToken, { secure: false, httpOnly: false });
    // res.send();
  } catch(e) {
    next('User Sign Up Route Error', e);
  }
};

const userSignIn = async (req, res, next) => {
  try {
    const user = {
      user: req.user,
      token: req.user.token,
      refreshToken: req.user.refreshToken,
    };
    res.status(200).json(user);
    // res.cookie('refreshToken', user.refreshToken, { secure: false, httpOnly: false });
    // res.send();
  } catch (e) {
    console.error(e);
    next('User Sign In Route Error', e);
  }
};

const getUsers = async (req, res, next) => {
  try {
    let oneRecord;
    let allRecords;
    if (req.params.id) {
      oneRecord = await users.findOne({
        where: { id: req.params.id },
        includes: users,
      });
    } else if (!req.params.id) {
      allRecords = await users.findAll({});
    }
    if (allRecords) {
      return res.status(200).json(allRecords);
    } else if (oneRecord) {
      return res.status(200).json(oneRecord);
    }
    return;
  } catch (e) {
    next('Get User Route Error', e);
  }
};

authRouter.post('/signup', userSignUp);
authRouter.post('/signin', basicAuth, userSignIn);
authRouter.get('/users', bearerAuth, permissions('update'), getUsers);
authRouter.get('/users/:id', bearerAuth, permissions('update'), getUsers);

module.exports = authRouter;
