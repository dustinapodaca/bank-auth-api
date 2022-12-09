'use strict';

const withdrawalModel = (sequelize, DataTypes) => {
  const model = sequelize.define('Withdrawal', {
    typeof:
    {
      type: DataTypes.ENUM,
      values: ['cash', 'check', 'mobile', 'wire'],
      required: true,
    },
    amount:
    {
      type: DataTypes.INTEGER,
      required: true,
      defaultValue: 0,
    },
  });
  return model;
};

module.exports = withdrawalModel;
