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
        field: 'id, stu_num, stu_name, stu_academy' //附属表查询的字段 注：关联字段必须查询
      }
    };
   
    async allPerson(config) {
      const perPage = 15 
      let _where = {
         b_id: config.b_id,
      }
      let order = ''
      if(config.type == 'up')
        order = 'sb_score'
      else
        order = 'sb_score desc'
      return {
        pageMessage : await this
        .where(_where)
        .field('sb_score,sb_commit,stu_id')
        .order(order)
        .page(config.page, perPage)
        .countSelect(),
      }
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

    async selectByStunum(message,branch,sort) {
      if(sort == 'up') {
        sort = 'ASC';
      }
      if(sort == 'down') {
        sort = 'DESC';
      }
      let sql = `select sb_score,stu_num,stu_name,stu_academy,student.id 
      FROM student,stubranch 
      WHERE student.stu_num = "${message}" AND student.id = stubranch.stu_id AND stubranch.b_id = "${branch}" ORDER BY sb_score ${sort}`,
          data = await this.query(sql);
      return data;

    }
     async selectByAcademy(message,branch,sort) {
      if(sort == 'up') {
        sort = 'ASC';
      }
      if(sort == 'down') {
        sort = 'DESC';
      }
      let sql = `select sb_score,stu_num,stu_name,stu_academy,student.id 
      FROM student,stubranch 
      WHERE student.stu_academy = "${message}" AND student.id = stubranch.stu_id AND stubranch.b_id = "${branch}" ORDER BY sb_score ${sort}`,
          data = await this.query(sql);
      return data;

    }
     async selectByStuname(message,branch,sort) {
      if(sort == 'up') {
        sort = 'ASC';
      }
      if(sort == 'down') {
        sort = 'DESC';
      }
      let sql = `select sb_score,stu_num,stu_name,stu_academy,student.id 
      FROM student,stubranch 
      WHERE student.stu_name = "${message}" AND student.id = stubranch.stu_id AND stubranch.b_id = "${branch}" ORDER BY sb_score ${sort}`,
          data = await this.query(sql);
      return data;

    }
}
