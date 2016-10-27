'use strict';
/**
 * model
 */
export default class extends think.model.relation {
    init(...args){
        super.init(...args);
    }
    relation = {
        student: {
          type: think.model.HAS_MANY,
          model: 'student',
          key: 'stu_id',
          fKey: 'id',
          field: 'id,stu_num,stu_name'
        }
      };

    async dec(_where,_update) {
       await this
       .where(_where)
       .update(_update);
    }


    async check(_where) {
        return await this.where(_where).field('stu_id,hw_time,hw_score').select();
    }
}