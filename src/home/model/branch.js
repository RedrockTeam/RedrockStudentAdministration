'use strict';
/**
 * model
 */
export default class extends think.model.base {
    async findManager(_config) {
        return await this
                .where(_config)
                .find();
    }
}