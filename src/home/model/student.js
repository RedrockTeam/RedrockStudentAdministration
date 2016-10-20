'use strict';
/**
 * model
 */
export default class extends think.model.base {
    async commitHomework(config){
      this
      .model('commit')
      .add(config)
    }
}