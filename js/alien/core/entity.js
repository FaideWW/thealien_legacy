/**
 * Created by faide on 2014-08-11.
 */
'use strict';

define([], function () {

    /**
     * TODO: remove this when components are defined
     * @typedef {Object} Component
     */



    /**
     * Creates an Entity instance. An Entity is a collection of
     * components, and a "key" that is an aggregation of
     * the component flags that the Entity contains. The key is used
     * when systems filter out Entities that do not contain the requisite
     * components, using their key to identify what components they contain.
     *
     * @param {Object} options
     * @returns {Entity}
     * @constructor
     */
    function Entity(options) {
        if (!(this instanceof Entity)) {
            return new Entity(options);
        }

        /** @type {string}
         *    UUID generator from https://gist.github.com/gordonbrander/2230317
         */
        this.id = Math.random().toString(36).substr(2, 9);
        /** @type {number} */
        this.key = 0;
        /** @type {Array<Component>} */
        this.components = [];
    }

    Entity.prototype = {

        /**
         * Adds a component to the Entity and updates the Entity key
         *
         * @param {number}    component_flag    The registry flag for this component type
         * @param {Component} component         The component object
         * @returns {Entity}                    Itself (for chaining)
         */
        addComponent: function (component_flag, component) {
            // bitwise OR the flag onto the key
            this.key |= component_flag;
            this.components[component_flag] = component;
            return this;
        },

        /**
         * Removes a component from the Entity, and updates the key accordingly
         * @param {number} component_flag       The registry flag of the removed component
         * @returns {Entity}                    Itself (for chaining)
         */
        removeComponent: function (component_flag) {
            // fail silently if the component does not exist
            if (this.key | component_flag === this.key) {
                // inverse bitwise OR: ( key AND (NOT flag) )
                this.key &= ~component_flag;
                this.components[component_flag] = undefined;
            }
            return this;
        }
    };

    return Entity;
});