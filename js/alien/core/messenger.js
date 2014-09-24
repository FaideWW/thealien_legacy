/**
 * Created by faide on 2014-08-11.
 */
'use strict';
define([], function () {

    /** @type {Object<string, Array<function>>} */
    var queue = {};

    return {
        /**
         * Append a message to the target system's queue
         * @param {string}   sys    The system that should resolve the message
         * @param {function} msg    The message to be resolved
         */
        enqueue: function (sys, msg) {
            // if the target system does not have a queue, create it
            if (!queue[sys]) {
                queue[sys] = [];
            }

            queue[sys].push(msg);
        },
        /**
         * Digest all messages in the target system's queue
         * @param {string} sys       The system to resolve
         * @param {Object} [thisArg] The system's calling context
         */
        resolve: function (sys, thisArg) {
            while (queue[sys] && queue[sys].length) {
                queue[sys].pop().call(thisArg);
            }
        }
    }
});