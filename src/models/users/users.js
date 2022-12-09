'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET || 'bankSecret';

const userModel = (sequelize, DataTypes) => {
  const model = sequelize.define('Users', {
    username: {
      type: DataTypes.STRING,
      required: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      required: true,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM,
      values: ['user', 'banker', 'admin'],
      required: true,
      defaultValue: 'user',
    },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username }, SECRET, {
          algorithm: 'HS256',
          expiresIn: 1000 * 60 * 60 * 24,
        });
      },
      set(tokenObj) {
        let token = jwt.sign(tokenObj, SECRET);
        return token;
      },
    },
    refreshToken: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username }, SECRET, {
          algorithm: 'HS256',
          expiresIn: 1000 * 60 * 60 * 24 * 15,
        });
      },
      set(tokenObj) {
        let refreshToken = jwt.sign(tokenObj, SECRET);
        return refreshToken;
      },
    },
    capabilities: {
      type: DataTypes.VIRTUAL,
      get() {
        const acl = {
          user: ['read', 'create'],
          banker: ['read', 'create', 'update'],
          admin: ['read', 'create', 'update', 'delete'],
        };
        return acl[this.role];
      },
    },
  });

  model.beforeCreate(async(user) => {
    let hashedPass = await bcrypt.hash(user.password, 6);
    user.password = hashedPass;
    return user;
  });

  model.authBasic = async function(username, password) {
    const user = await this.findOne({ where: { username } });
    const validUser = await bcrypt.compare(password, user.password);
    if (validUser) {
      return user;
    }
    throw new Error('Invalid User');
  };

  model.authToken = async function(token) {
    try {
      const parsedToken = jwt.verify(token, SECRET);
      const user = this.findOne({ where: { username: parsedToken.username } });
      if (user) {
        return user;
      }
      throw new Error('User Not Found');
    } catch (e) {
      console.error('authToken Error', e.message);
    }
  };

  return model;
};

module.exports = userModel;
