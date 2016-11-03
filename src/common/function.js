'use strict';
export function res(state, message) {
    return JSON.stringify({
        status: state,
        message: message
    })
}
