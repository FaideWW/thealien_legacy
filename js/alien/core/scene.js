/**
 * Created by faide on 2014-09-04.
 */
'use strict';

//TODO: consider how to properly cache initial state while preserving Proxy functionality

define(['lodash'], function (_) {

    var scene_cache = {};

    /** @typedef {} TileMap */

    /**
     * Creates a new Scene object based on the provided options
     * @param {Object}        options             The options object
     * @param {Array<Entity>} options.entities    A list of entities that are present in the scene
     * @param {TileMap}       [options.tilemap]   An optional tilemap object
     * @constructor
     */
    function Scene(options) {

        /** @type {string}
         *    UUID generator from https://gist.github.com/gordonbrander/2230317
         */
        this.id = Math.random().toString(36).substr(2, 9);


        // declare references to singletons; they will be initialized when attached to a game
        this.msg = null;
        this.input = null;
        this.renderTarget = null;

        this.goTo = null;

        options = options || {};

        this.entities = options.entities || [];

        this.tilemap = options.tilemap || null;

        // memoize the scene's initial state (shallow copy, entities/components have their own caching

        scene_cache[this.id] = {
            entities: _.clone(this.entities),
            tilemap: _.clone(this.tilemap)
        };
    }

    Scene.prototype = {
        each: function (callback, lock, thisArg) {
            var i, entity;
            for (i = 0; i < this.entities.length; i += 1) {
                entity = this.entities[i];
                if ((entity.key & lock) === lock) {
                    callback.call(thisArg, entity);
                }
            }
        },

        pairs: function (callback, lock, thisArg) {
            var i, j, entity1, entity2;
            for (i = 0; i < this.entities.length; i += 1) {
                entity1 = this.entities[i];
                if ((entity1.key & lock) === lock) {
                    for (j = i + 1; j < this.entities.length; j += 1) {
                        entity2 = this.entities[j];
                        if ((entity2.key & lock) === lock) {
                            callback.call(thisArg, entity1, entity2);
                        }
                    }
                }
            }
        },

        // retrieval of cached initial state
        reset: function () {
            var i;
            this.entities = _.clone(scene_cache[this.id].entities);
            for (i = 0; i < this.entities.length; i += 1) {
                this.entities[i].reset();
            }
            this.tilemap  = _.clone(scene_cache[this.id].tilemap);
        }
    };

    return Scene;
});