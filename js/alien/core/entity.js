/**
 * Created by faide on 2014-08-11.
 */

define([], function () {
    'use strict';

    function Entity(options) {
        if (!(this instanceof Entity)) {
            return new Entity(options);
        }

        this.id = new Date().getTime();
        this.key = 0;
        this.components = [];
    }

    Entity.prototype = {
        addComponent: function (component_flag, component) {
            this.key |= component_flag;
            this.components[component_flag] = component;
            return this;
        },
        removeComponent: function (component_flag) {
            this.key &= ~component_flag;
            this.components[component_flag] = null;
            return this;
        }
    };

    return Entity;
});