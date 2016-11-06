'use strict';
/**
 * model
 */
export default class extends think.model.relation {
  async del(id){
    return await this
    .model('courseware')
    .delete({
      where: {id: id}
    })
  }
}