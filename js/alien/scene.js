/**
 * Created by faide on 2014-04-11.
 */
define(['underscore', 'alien/entity', 'alien/logging'], function (_, Entity, Log) {
    'use strict';
    var Scene = (function () {
        var id_counter = 0,
            scene_ids = [];
        function Scene(id, entities) {
            if (!(this instanceof Scene)) {
                return new Scene(id, entities);
            }

            /*
             If an id is supplied (i.e. not a falsey value)
             and the id supplied is already in use, throw an error.
             If no id is supplied, generate one.
             */
            if (id) {
                if (scene_ids.indexOf(id) !== -1) {
                    return Log.error("Scene with that id already exists");
                }
                this.id = id;
            } else {
                do {
                    id = "scene_" + id_counter;
                    id_counter += 1;
                } while (scene_ids.indexOf(id) !== -1);
                this.id = id;
            }
            scene_ids.push(this.id);
            this.entities = {};
            if (entities) {
                if (entities.length) {
                    var i, l = entities.length;
                    for (i = 0; i < l; i += 1) {
                        this.entities[entities[i].id] = entities[i];
                    }
                } else {
                    this.entities = entities;
                }
            }
        }

        Scene.prototype = {
            addEntity: function (e) {
                this.entities[e.id] = e;
                return this;
            },
            destroy: function () {
                scene_ids.splice(scene_ids.indexOf(this.id), 1);
            },
            removeEntity: function (e_id) {
                if (e_id instanceof Entity) {
                    e_id = e_id.id;
                }
                this.entities[e_id] = undefined;
                return this;
            },
            getEntities: function () {
                return _.values(this.entities);
            },
            getComponents: function (component_name) {
                /* returns a list of components from all entities in the scene.  skips entities that do not have that component */
                return _.reject(this.getComponentsInPlace(component_name), _.isUndefined);
            },
            getComponentsInPlace: function (component_name) {
                /* same as above, but leaves undefined values in place to preserve order (for combining multiple component lists) */
                return _.pluck(this.entities, component_name);
            },
            getAllWith: function (component) {
                return _.filter(this.entities, function (entity) {
                    return _.has(entity, component);
                });
            },
            getAllWithAllOf: function (components) {
                return _.filter(this.entities, function (entity) {
                    return _.every(components, function (component) {
                        return _.has(this, component);
                    }, entity);
                });
            },
            getAllWithOneOf: function (components) {
                return _.filter(this.entities, function (entity) {
                    return _.some(components, function (component) {
                        return _.has(this, component);
                    }, entity);
                });
            }
        };

        return Scene;
    }());

    return Scene;
});