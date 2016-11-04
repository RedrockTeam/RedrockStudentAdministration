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

 
    async check(_where,state,b_id) {
        if(state == 'already') {
        return await this
        .where(_where)
        .field('stu_id,hw_time,hw_score,cm_place')
        .select();
        } else {
        let sql1 = `select stu_name,stu_num,student.id,sb_commit from student,stubranch where student.id not in(select stu_id from commit where hw_id = "${_where.hw_id}") AND stubranch.stu_id = student.id`,
            sql2 = `select COUNT(*) as allhw from homework where id = "${b_id}"`,
            data2 = await this.query(sql2),
            data1 =await this.query(sql1),
            data = [];
            data.push(data1[0],data2[0]);
        return data;
        }
      
    }
}