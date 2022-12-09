'use strict';

const withdrawalModel = (sequelize, DataTypes) => {
  const model = sequelize.define('Withdrawal', {
    typeOf:
    {
      type: DataTypes.ENUM,
      value: ['cash', 'check', 'mobile', 'wire'],
      required: true,
    },
    amount:
    {
      type: DataTypes.INTEGER,
      required: true,
    },
  });
  return model;
};

module.exports = withdrawalModel;
