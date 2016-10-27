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
        this.tablePrefix = '';
        this.tableName = 'stubranch'
    }

    relation = {
        student: {
        type: think.model.HAS_MANY,
        model: 'student', //关联模型
        key: 'stu_id',//本模型的关联字段
        fKey: 'id',//被关联模型（作为附属表）的对应关联字段  stu_id == id
        field: 'id,stu_name,stu_academy' //附属表查询的字段 注：关联字段必须查询
      }
    };
   
    async allPerson(_where) {
      return await this.where(_where).field('sb_score,sb_commit,stu_id').select();
    }

    async updateScore(_where,_update) {
      return await this.where(_where).update(_update);
    }

    async delStu(_where) {
      return await this.where(_where).delete();
    }

    async isNull(_where) {
      return await this.where(_where).select();
    }

}
