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
        //if listeners have been cloned over, keep them
        //otherwise start a new list
        this.listeners = this.listeners || {};
    }

    Entity.prototype.extend = function (extension) {
        var k;
        for (k in extension) {
            if (extension.hasOwnProperty(k)) {
                this[k] = extension[k];
            }
        }
        return this;
    };

    Entity.prototype.on = function (event, callback) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(callback);

        return this;
    };

    Entity.prototype.isListeningFor = function (event) {
        if (this.listeners.hasOwnProperty(event)) {
            return this.listeners[event].length > 0;
        }

        return this;
    };

    Entity.prototype.trigger = function (event, data) {
        if (this.listeners[event]) {
            var i;
            for (i = 0; i < this.listeners[event].length; i += 1) {
                this.listeners[event][i](this, data);
            }
        }
        
        return this;
    };

    return Entity;

}());

