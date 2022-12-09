'use strict';

class DataInterface {
  constructor(model) {
    this.model = model;
  }

  async read(id = null) {
    try {
      let record;
      if (id) {
        record = await this.model.findOne({ where: { id } });
      } else {
        record = await this.model.findAll();
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
      let record = await this.model.findOne({ where: { id } });
      return record.update(jsonData);
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
