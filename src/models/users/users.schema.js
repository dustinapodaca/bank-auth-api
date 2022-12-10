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
      unique: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: ['user', 'teller', 'admin'],
      required: true,
      defaultValue: 'user',
    },
    accountNumber: {
      type: DataTypes.BIGINT,
      get() {
        return this.getDataValue('accountNumber');
      },
      // always reset the default value of the account number to a random number
      set() {
        this.setDataValue('accountNumber', Math.floor(Math.random() * 1000000000 + 111));
      },
      required: false,
      unique: true,
    },
    accountType: {
      type: DataTypes.ENUM,
      values: ['checking', 'savings'],
      required: false,
      defaultValue: 'checking',
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
          teller: ['read', 'create', 'update'],
          admin: ['read', 'create', 'update', 'delete'],
        };
        return acl[this.role];
      },
    },
    balance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      //get and set the balance
      get() {
        return this.getDataValue('balance');
      },
      set(value) {
        this.setDataValue('balance', value);
      },
    },
  });

  model.beforeCreate(async(user) => {
    let hashedPass = await bcrypt.hash(user.password, 6);
    user.password = hashedPass;
    user.accountNumber = Math.floor(Math.random() * 1000000000 + 111);
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

  //update the user balance
  // model.updateBalance = async function(id, amount) {
  //   const user = await this.findOne({ where: { id } });
  //   console.log('user from updateBalance', user);
  //   if (amount < 0 && user.balance + amount < 0) {
  //     return 'Insufficient Funds';
  //   } else if (amount < 0 && user.balance + amount >= 0) {
  //     const newBalance = user.balance + amount;
  //     user.balance = newBalance;
  //     await user.save();
  //     return user;
  //   } else if (amount > 0) {
  //     const newBalance = user.balance + amount;
  //     user.balance = newBalance;
  //     await user.save();
  //     return user;
  //   } else {
  //     return 'Invalid Amount';
  //   }
  // };

  return model;
};

module.exports = userModel;
