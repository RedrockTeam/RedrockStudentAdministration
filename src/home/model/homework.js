'use strict';
/**
 * relation model
 */
export default class extends think.model.relation {
  /**
   * init
   * @param  {} args []
   * @return {}         []
   */
  init(...args){
    super.init(...args);
  }
  relation = {
    commit: {
      type: think.model.HAS_MANY,
      model: 'commit',
      key: 'id',
      fKey: 'hw_id',
      field: 'hw_id'
    }
  };

  async addDoc(_add) {
    return await this.add(_add);
  }

  async notEnd(_where) {
    return this.where(_where).field('id','hw_title','hw_detail','hw_pulish','hw_deadline').select();
  }

}