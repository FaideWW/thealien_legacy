/**
 * Created by faide on 2014-04-11.
 */
define(['underscore', 'alien/logging'], function (_, Log) {
    'use strict';
    var Entity = (function () {
        var id_counter = 0,
            entity_ids = [];
        function Entity(id, options) {
            if (!(this instanceof Entity)) {
                return new Entity(options);
            }

            options = options || {};

            if (typeof id !== "string") {
                options = id || {};
                id = null;
            }
            /*
             If an id is supplied (i.e. not a falsey value)
             and the id supplied is already in use, throw an error.
             If no id is supplied, generate one.
             */
            if (options.id) {
                id = options.id;
            }
            if (id) {
                if (entity_ids.indexOf(id) !== -1) {
                    return Log.error("Entity with that id already exists");
                }
                this.id = id;
            } else {
                do {
                    id = "entity_" + id_counter;
                    id_counter += 1;
                } while (entity_ids.indexOf(id) !== -1);
                this.id = id;
            }
            entity_ids.push(this.id);

            this.isStatic = false;

            _.each(options, function (component, name) {
                if (name === "id") {
                    return;
                }
                this.addComponent(component, name);
            }, this);
        }

        Entity.prototype = {
            addComponent: function (component, id) {
                this[id] = component;
                return this;
            },
            removeComponent: function (id) {
                this[id] = undefined;
                return this;
            },
            destroy: function () {
                /*
                    Removes the id from the id list
                 */
                entity_ids = entity_ids.splice(entity_ids.indexOf(this.id), 1);
            }
        };

        return Entity;
    }());

    return Entity;
});