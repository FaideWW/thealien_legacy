define(function() {
    /**
     * Action queue for objects
     * Borrows heavily from (read: is identical to) jQuery's Deferred object,
     * which is an implementation of CommonJS's Promises/A proposal
     *
     * Allows for chaining actions together to create a sequence of events,
     *  with the possibility to broadcast either progress or completion of a certain action
     * 
     */

     var Promise = (function() {
         'use strict';
     
         var Promise = {
             _status: "pending",
             _progress: 0,
             resolutions: [],
             failures: [],
             notifies: [],
             fulfill: function() {
                if (this._status === "pending") {
                    this._status = "resolved";
                    var f;
                    for (f in this.resolutions) {

                        this.resolutions[f]();
                        this.resolutions.shift();
                    }
                }
             },
             reject: function() {
                if (this._status === "pending") {
                    this._status = "failed";
                    var f;
                    for (f in this.failures) {
                        this.failures[f]();
                        this.failures.shift();
                    }
                }
             },
             notify: function(status) {
                if (this._status === "pending") {
                    var f;
                    for (f in this.notifies) {
                        this.notifies[f](status);

                    }
                }
             },
             when: function(resolveCB, failCB, progressCB) {
                this.resolutions.push(resolveCB);
                this.failures.push(failCB);
                this.extend({
                    "complete": function() {
                        this.fulfill();
                    },
                    "interrupt": function() {
                        this.reject();
                    }
                });

                if (progressCB) {
                    this.notifies.push(progressCB);
                    this.extend({
                        "update": function() {
                            this.notify(this._progress);
                        }
                    })
                }

                return this;
             },
             setProgress: function(p) {
                this._progress = p;
                return this;
             },
             done: function(resolveCB) {
                this.resolutions.push(resolveCB);
                this.extend({
                    "!complete": function() {
                        this.fulfill();
                    }
                });
                return this;
             },
             fail: function(failCB) {
                this.failures.push(failCB);
                this.extend({
                    "!interrupt": function() {
                        this.reject();
                    }
                });
                return this;
             }
         };
     
         return Promise;

    }());

    return Promise;
});