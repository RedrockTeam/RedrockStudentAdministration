'use strict';
/**
 * model
 */
export default class extends think.model.base {
    async commitHomework(config){
      await this
      .model('commit')
      .add(config)
    }

    async getStuBase(id){
      let data = await this
      .model('student')
      .where({
        id: id
      })
      .select()
      return data
    }

    async selectId(where){
      let data =  await this
        .model('student')
        .where(where)
        .field('id')
        .select()
        return data
      }

    async getBranch(id){
      let data = await this
      .model('stubranch')
      .where({
        stu_id: id 
      })
      .select()
      return data
    }

    async getStuMessageById(id){
      let allMessage = {}
      allMessage.branch = []
      let base = await this.getStuBase(id),
          branch = await this.getBranch(id)
      allMessage.id = base[0].id
      allMessage.stunum = base[0].stu_num
      allMessage.stuacademy = base[0].stu_academy
      allMessage.stuname = base[0].stu_name
      for(let item of branch){
        let branch_id = item.b_id
        let branch_name = await this
        .model('branch')
        .where({
          id: branch_id
        })
        .field('b_name')
        .select()
        let final = Object.assign({}, item, branch_name[0])
        allMessage.branch.push(final)
      }
      return allMessage
    }
    async getUnfinsh(id){
      let sql = `select * from homework where id not in (select hw_id from commit where stu_id = ${id}) and b_id in (select b_id from stubranch where stu_id = ${id})`,
          data = await this.query(sql)
          return data
    }
    async getFinsh(id){
      let sql = `select * from homework where id in (select hw_id from commit where stu_id = ${id})`,
          data = await this.query(sql)
          return data
    }
    async getTimeout(id){
      let now = think.datetime(new Date, 'YYYY-MM-DD HH:mm:ss')
      let sql = `select * from homework where hw_deadline < "${now}" and b_id in (select b_id from stubranch where stu_id = ${id})`,
          data = await this.query(sql)
          return data
    }
    async getCourseWare(id){
      let data = await this
      .model('courseware')
      .where({
        cw_branch: id
      })
      .select()
      return data
    }
}