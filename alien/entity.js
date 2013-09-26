var alien = alien || {};

alien.Entity = (function () {
    'use strict';

    function Entity(properties) {
        // enforces new
        if (!(this instanceof alien.Entity)) {
            return new alien.Entity(properties);
        }
        properties = properties || {};
        var k;
        for (k in properties) {
            if (properties.hasOwnProperty(k)) {
                this[k] = properties[k];
            }
        }
    }

    return Entity;

}());

