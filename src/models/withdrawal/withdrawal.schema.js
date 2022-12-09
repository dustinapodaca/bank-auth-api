'use strict';

const withdrawalModel = (sequelize, DataTypes) => {
  const model = sequelize.define('Withdrawal', {
    typeof: {
      type: DataTypes.ENUM,
      values: ['cash', 'check', 'mobile', 'wire'],
      required: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      required: true,
      defaultValue: 0,
    },
    withdrawalTime: {
      type: DataTypes.DATE,
      required: false,
      defaultValue: DataTypes.NOW,
    },
  });

  model.updateBalance = async function (user, amount) {
    console.log('user from withdrawal updateBalance', user);
    if (amount > 0 && user.balance - amount < 0) {
      return 'Insufficient Funds';
    } else if (amount > 0 && user.balance - amount >= 0) {
      const newBalance = user.balance - amount;
      user.balance = newBalance;
      await user.save();
      return user;
    }
  };
  return model;
};

module.exports = withdrawalModel;
