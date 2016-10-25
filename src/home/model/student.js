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
}