'use strict';
/**
 * model
 */
export default class extends think.model.base {
    async dec(_where,_update) {
       await this.where(_where).update(_update);
    }
}