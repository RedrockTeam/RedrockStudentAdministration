'use strict';
/**
 * model
 */
export default class extends think.model.base {
    async login(){
      console.log(await this.model('user'))
    }
}