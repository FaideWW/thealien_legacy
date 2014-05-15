/**
 * Created by faide on 2014-04-22.
 */

/* TODO: Custom events for entities */

define(['underscore'], function (_) {
    "use strict";
    var EventSystem,
        createListener = function (event) {
            return function (event_data) {
                EventSystem.trigger(event_data.type, null, event_data);
            };
        },
        generateWindowListeners = function (events) {
            _.each(events, function (e) {
                /**
                 * Create a listener for an event type and bind it to the window
                 *
                 * @param event_data
                 */
                var l = createListener(e);
                window.addEventListener(e, l);
            });
        },
        triggerCallback = function (cb, context, event_data) {
            if (event_data.type === "keydown") {
                if (!EventSystem.keys_pressed[event_data.keyCode]) {
                    cb.handler.call(context, event_data);
                } else if (!cb.once) {
                    cb.handler.call(context, EventSystem.keys_pressed[event_data.keyCode]);
                }
            } else {
                cb.handler.call(context, event_data);
            }
        },
        entities;
    EventSystem = {
        keys_pressed: {},
        init: function (events) {
            generateWindowListeners(events);
            entities = {};
        },
        on: function (entity, events, handler, once) {
            events = events.split(' ');
            _.each(events, function (event) {
                if (!this.hasOwnProperty(entity.id)) {
                    this[entity.id] = {
                        entity: entity
                    };
                }
                if (!this[entity.id].hasOwnProperty(event)) {
                    this[entity.id][event] = [];
                }
                this[entity.id][event].push({
                    handler: handler,
                    once:    once
                });
            }, entities);
            return this;
        },
        remove: function (entity, event, handler) {
            if (entities.hasOwnProperty(entity) && entities[entity].hasOwnProperty(event)) {
                if (handler) {
                    entities[entity][event] = _.filter(entities[entity][event], function (cb) {
                        return cb !== handler;
                    });
                } else {
                    entities[entity][event] = [];
                }
            }
            return this;
        },
        step: function (scene, dt) {
            this.trigger('update', null, dt);
            _.each(EventSystem.keys_pressed, function (event) {
                if (!event) {
                    return;
                }
                this.trigger('keydown', null, event);
            }, this);
        },
        trigger: function (event, entity, msg) {
            if (entity) {
                if (entity.entity) {
                    entity = entity.entity;
                }
                if (entities.hasOwnProperty(entity.id) && entities[entity.id].hasOwnProperty(event)) {
                    _.each(entities[entity.id][event], function (cb) {
                        triggerCallback(cb, entity, msg);
                    });
                }
            } else {
                _.each(entities, function (entity) {
                    /**
                     * If no entity is specified, trigger the event on all entities
                     */
                    this.trigger(event, entity, msg);
                }, this);
            }
            if (event === "keydown") {
                EventSystem.keys_pressed[msg.keyCode] = msg;
            } else if (event === "keyup") {
                EventSystem.keys_pressed[msg.keyCode] = false;
            }
            return this;
        }
    };
    return EventSystem;
});