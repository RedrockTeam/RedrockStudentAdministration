'use strict';
/**
 * model
 */
export default class extends think.model.base {
    async findManager(_config) {
        return this
                .where(_config)
                .find();
    }
}