'use strict';

const { users } = require('./index');

class DataInterface {
  constructor(model) {
    this.model = model;
  }

  async read(id = null, model) {
    try {
      let record;
      if (id) {
        record = await this.model.findOne({
          where: { id },
          includes: users,
        });
      }
      return record;
    } catch(e) {
      console.error('Read Interface Error', e);
    }
  }

  async create(jsonData) {
    try {
      let record = await this.model.create(jsonData);
      return record;
    } catch (e) {
      console.error('Create Interface Error', e);
    }
  }

  async update(id, jsonData) {
    try {
      console.log('JSON update data', jsonData);
      console.log('id', id);
      await this.model.update(jsonData, { where: { id } });
      let record = await this.model.findOne({
        where: { id },
        includes: users,
      });
      console.log('this is update record', record);
      return record;
    } catch (e) {
      console.error('Update Interface Error', e);
    }
  }

  async delete(id) {
    try {
      let record = await this.model.destroy({ where: { id } });
      return record;
    } catch (e) {
      console.error('Delete Interface Error', e);
    }
  }
}

module.exports = DataInterface;
