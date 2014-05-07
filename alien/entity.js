var alien = alien || {};



alien.Entity = (function () {
    'use strict';



    Entity.default_properties = {};

    function Entity(properties) {
        // enforces new
        if (!(this instanceof alien.Entity)) {
            return new alien.Entity(properties);
        }
        properties = properties || {};
        var k;
        for (k in Entity.default_properties) {
            if (Entity.default_properties.hasOwnProperty(k)) {
                this[k] = deepClone(Entity.default_properties[k]);
            }
        }
        for (k in properties) {
            if (properties.hasOwnProperty(k)) {
                this[k] = deepClone(properties[k]);
            }
        }
    }

    Entity.prototype.extend = function(module) {
        module = module || {};
        for (var property in module) {
            if (module.hasOwnProperty(property)) {
                this[property] = deepClone(module[property]);
            }
        }
        return this;
    };


    return Entity;

}());

