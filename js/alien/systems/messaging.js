/**
 * Created by faide on 2014-03-11.
 */
define(["underscore"], function (_) {
    'use strict';
    var queue,
        MessageSystem = {
            id: "__MESSAGING",
            init: function () {
                queue = {};
            },
            /**
             * Enqueues a message or list of messages to be resolved at the next update, or the update
             *  that occurs immediately after a given time has passed
             * @param system  : String                - the system which should resolve the collision
             * @param message : Message.Message|Array - the message object or a list of message objects to be resolved
             *
             */
            enqueue: function (system, message) {
                if (!queue[system]) {
                    queue[system] = [];
                }
                if (message.length) {
                    queue[system] = queue[system].concat(message);
                } else {
                    queue[system].push(message);
                }
            },
            fetch: function (system, context) {
                queue[system] = _.filter(queue[system], function (message) {
                    if (!message.delay || message.delay <= 0) {
                        message.cb.call(context || this, message.msg);
                        return false;
                    }
                    return true;
                });

            },
            step: function (scene, dt) {
                _.each(queue, function (system) {
                    return _.compact(_.map(system, function (m) {
                        if (!m) {
                            return;
                        }
                        if (m.delay) {
                            m.delay -= dt;
                        } else {
                            m.delay = 0;
                        }
                        return m;
                    }, this));
                }, this);
            }

        };

    return MessageSystem;
});