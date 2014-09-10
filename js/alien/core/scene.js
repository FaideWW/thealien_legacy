/**
 * Created by faide on 2014-09-04.
 */
'use strict';

define([], function () {

    /** @typedef {} TileMap */

    /**
     * Creates a new Scene object based on the provided options
     * @param {Object}        options             The options object
     * @param {Array<Entity>} options.entities    A list of entities that are present in the scene
     * @param {TileMap}       [options.tilemap]   An optional tilemap object
     * @constructor
     */
    function Scene(options) {

        // declare references to singletons; they will be initialized when attached to a game
        this.msg = null;
        this.input = null;
        this.renderTarget = null;

        options = options || {};

        this.entities = options.entities || [];

        this.tilemap = options.tilemap || null;
    }

    Scene.prototype.each = function(callback, lock, thisArg) {
        var i, entity;
        for (i = 0; i < this.entities.length; i += 1) {
            entity = this.entities[i];
            if (entity.key & lock === lock) {
                callback.call(thisArg, entity);
            }
        }
    };

    return Scene;
});