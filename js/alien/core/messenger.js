/**
 * Created by faide on 2014-08-11.
 */
define([], function () {
    'use strict';

    var queue = {};

    return {
        enqueue: function (sys, msg) {
            if (!queue[sys]) {
                queue[sys] = [];
            }

            queue[sys].push(msg);
        },
        resolve: function (sys) {
            while (queue[sys] && queue[sys].length) {
                queue[sys].pop()();
            }
        }
    }
});