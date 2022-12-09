'use strict';

const { users } = require('../../models');

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      authError();
    }
    const token = req.headers.authorization.split(' ').pop();
    const validUser = await users.authToken(token);
    req.user = validUser;
    req.token = validUser.token;
    next();
  } catch (e) {
    authError();
  }

  function authError() {
    next('Invalid Login');
  }
};
