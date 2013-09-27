var alien = alien || {};

alien.Entity = (function () {
    'use strict';

    function deepClone(obj) {
        var new_obj = {};
        obj = obj || {};
        if (typeof obj === 'object' && 'clone' in obj) {
            return obj.clone();
        }
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (typeof prop === 'object') {
                    if (prop.hasOwnProperty('clone')) {
                        new_obj[prop] = obj[prop].clone();
                    } else {
                        new_obj[prop] = deepClone(obj[prop]);
                    }
                }else{
                    new_obj[prop] = obj[prop];
                }
            }
        }
        return new_obj;
    }

    function Entity(properties) {
        // enforces new
        if (!(this instanceof alien.Entity)) {
            return new alien.Entity(properties);
        }
        properties = properties || {};
        var k;
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

