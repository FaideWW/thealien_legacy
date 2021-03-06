/**
 * Created by faide on 2014-08-11.
 */
'use strict';

define(['lodash', 'core/componentfactory'], function (_, cf) {
    /**
     * Prevents accidental overwrite of component references.
     *  Intercepts property assignments and passes them through
     *  into the component itself
     *
     *  entity.position = math.vec2(5,5)    ->     let temp_v        = math.vec2(5,5)
     *                                             entity.position.x = temp_v.x
     *                                             entity.position.y = temp_v.y
     *
     * @param {Entity} entity
     * @param {string} name
     * @param {number} flag
     */
    var proxifyComponent = function (entity, name, flag) {
        Object.defineProperty(entity, name, {
            get: function () {
                return entity.components[flag];
            },
            set: function (val) {
                var prop;
                if (typeof val === 'object') {
                    for (prop in val) {
                        if (val.hasOwnProperty(prop)) {
                            entity.components[flag][prop] = val[prop];
                        }
                    }
                } else {
                    throw new Error('Cannot set component `' + name + '` to a primitive type');
                }
            }
        });
//        entity[name] = entity.components[flag];
    };

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
     * @param {Object|Object.<string,Component>} options
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
        this.id = "entity_" + Math.random().toString(36).substr(2, 9);
        /** @type {number} */
        this.key = 0;
        /** @type {Array<Component>} */
        this.components = [];

        if (typeof options === 'object') {
            _.each(options, function (c, i) {
                var component = cf.createComponent(i, c);
                //back-reference, for deferred key resolution
                component.__entity = this;
                // shorthand syntactic sugar
//                this[i] = component;
                if (component.__flag) {
                    proxifyComponent(this, i, component.__flag);
                }

                this.key |= component.__flag;
                this.components[component.__flag] = component;
            }, this);
        }
    }

    Entity.prototype = {
        __resolveDeferredComponent: function (component) {
            this.key |= component.__flag;
            this.components[component.__flag] = component;
            proxifyComponent(this, component.__name, component.__flag);
        },

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
        },
        reset: function () {
            var i;
            for (i = 0; i < this.components.length; i += 1) {
                if (this.components[i]) {
                    this.components[i].__reset();
                }
            }
        }
    };

    return Entity;
});