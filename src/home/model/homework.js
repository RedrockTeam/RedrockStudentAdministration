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
    }
  };

  async addDoc(_add) {
    return await this.add(_add);
  }

  async notEnd(_where) {
    return this.where(_where).select();
  }

  async del(_where){
    return this.setRelation('commit', false).where(_where).delete();
  }
  async getHomeworkConditionById(id){
    let sql = `SELECT commit.id, student.stu_name, student.stu_num, commit.hw_time, commit.hw_score, commit.cm_place FROM commit, student WHERE commit.hw_id = ${id}`,
        data = await this.query(sql)
        return data
  }
}