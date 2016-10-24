'use strict';
export function res(state, message) {
    return this.json({
        status: state,
        message: message
    })
}
