/**
 * Created by faide on 2014-09-04.
 */
'use strict';

define([], function () {
    /**
     * Creates a new Scene object based on the provided options
     * @param {Object}        options           The options object
     * @param {Array<Entity>} options.entities  A list of entities that are present in the scene
     * @constructor
     */
    function Scene(options) {
        options = options || {};

        this.entities = options.entities || [];
    }

    return Scene;
});