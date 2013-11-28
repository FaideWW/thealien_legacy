define(["./global"], function(Global) {
    /**
     * Entity
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
     *  Entity.default_properties contains a list of all variables that 
     *  should exist when an Entity is initialized, in order for a module to 
     *  properly carry out its functionality.
     *
     * todo
     *  - TBD
     * 
     */
    var Entity = (function () {
        'use strict';



        Entity.default_properties = {};

        function Entity(properties) {
            // enforces new
            if (!(this instanceof Entity)) {
                return new Entity(properties);
            }
            properties = properties || {};
            var k;
            for (k in Entity.default_properties) {
                if (Entity.default_properties.hasOwnProperty(k)) {
                    this[k] = Global.deepClone(Entity.default_properties[k]);
                }
            }
            for (k in properties) {
                if (properties.hasOwnProperty(k)) {
                    this[k] = Global.deepClone(properties[k]);
                }
            }
        }

        Entity.prototype.extend = Global.extend;

        Entity.prototype.set = function(property, value) {
            this[property] = value;
            return this;
        };


        return Entity;

    }());
    return Entity;
});
