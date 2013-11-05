/**
 * alien.Entity
 *
 * The container for any object which have a representation within
 *  the game.
 * ~ Entity.prototype.extend ( module : Object )
 *     - appends a particular entity with a suite of functionality
 *       provided by module
 *
 * ~ Entity.prototype.set ( property : String, value : ? )
 *     - sets the pre-existing value of a variable to the new value.
 *
 * Entities by themselves have no functionality. The real power of Entities 
 *  exists within the prototype; alien modules extend Entity.prototype with 
 *  functions that are made available to all Entities.  In addition, 
 *  alien.Entity.default_properties contains a list of all variables that 
 *  should exist when an Entity is initialized, in order for a module to 
 *  properly carry out its functionality.
 *
 * todo
 *  - TBD
 * 
 */

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

    Entity.prototype.set = function(property, value) {
        this[property] = value;
        return this;
    };


    return Entity;

}());

