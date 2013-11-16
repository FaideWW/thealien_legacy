/**
 * Action queue for objects
 * Borrows heavily from (read: is identical to) jQuery's Deferred object,
 * which is an implementation of CommonJS's Promises/A proposal
 *
 * Allows for chaining actions together to create a sequence of events,
 *  with the possibility to broadcast either progress or completion of a certain action
 * 
 */

var alien = alien || {};

alien.Promise = (function() {
    'use strict';

    

    function Promise(args) {
        // enforces new
        if (!(this instanceof Promise)) {
            return new Promise(args);
        }
        // constructor body
    }

    Promise.prototype.methodName = function(args) {
        // method body
    }

    return Promise;

}());