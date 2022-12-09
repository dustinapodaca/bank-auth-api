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
  } catch(e) {
    next('User Sign Up Route Error', e);
  }
};

// const userSignIn = async (req, res, next) => {
//   const user
// }


authRouter.post('/signup', userSignUp);
authRouter.post('/signin', basicAuth, userSignIn);
authRouter.get('/users', bearerAuth, getUsers);

module.exports = authRouter;
