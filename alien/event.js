var alien = alien || {};



alien.EventManager = function() {

    alien.Entity.prototype.on = function (event, callback) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(callback);

        return this;
    };

    alien.Entity.prototype.isListeningFor = function (event) {
        if (this.listeners.hasOwnProperty(event)) {
            return this.listeners[event].length > 0;
        }

        return this;
    };

    alien.Entity.prototype.trigger = function (event, data) {
        if (this.listeners[event]) {
            var i;
            for (i = 0; i < this.listeners[event].length; i += 1) {
                this.listeners[event][i](this, data);
            }
        }
        
        return this;
    };

    alien.Entity.prototype.listeners = {};

    alien.Game.prototype.registerEventListeners = function(canvas, scene) {
        var e;
            for (e in alien.EventManager) {
                if (alien.EventManager.hasOwnProperty(e)) {
                    this.canvas.addEventListener(e, function(ev) {
                        alien.EventManager[ev.type](ev, scene);
                    });
                }
            }
    };

    return {
        click: function(event, scene) {
            scene = scene || {};
            var entities = scene.entities || [];
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].isListeningFor('click')) {
                    entities[i].trigger('click', {
                        event: event
                    });
                }
            }
        },
        dblclick: function(event, scene) {
            scene = scene || {};
            var entities = scene.entities || [];
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].isListeningFor('dblclick')) {
                    entities[i].trigger('dblclick', {
                        event: event
                    });
                }
            }
        },
        mousedown: function(event, scene) {
            scene = scene || {};
            var entities = scene.entities || [];
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].isListeningFor('mousedown')) {
                    entities[i].trigger('mousedown', {
                        event: event
                    });
                }
            }
        },
        mouseup: function(event, scene) {
            scene = scene || {};
            var entities = scene.entities || [];
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].isListeningFor('mouseup')) {
                    entities[i].trigger('mouseup', {
                        event: event
                    });
                }
            }
        },
        mouseover: function(event, scene) {
            scene = scene || {};
            var entities = scene.entities || [];
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].isListeningFor('mouseover')) {
                    entities[i].trigger('mouseover', {
                        event: event
                    });
                }
            }
        },
        mousemove: function(event, scene) {
            scene = scene || {};
            var entities = scene.entities || [],
                i;
            for (i = 0; i < entities.length; i++) {
                if (entities[i].isListeningFor('mousemove')) {
                    entities[i].trigger('mousemove', {
                        event: event
                    });
                }
            }
        },
        mouseout: function(event, scene) {
            scene = scene || {};
            var entities = scene.entities || [];
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].isListeningFor('mouseout')) {
                    entities[i].trigger('mouseout', {
                        event: event
                    });
                }
            }
        },
        keyup: function(event, scene) {
            scene = scene || {};
            var entities = scene.entities || [];
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].isListeningFor('keyup')) {
                    entities[i].trigger('keyup', {
                        event: event
                    });
                }
            }
        },
        keydown: function(event, scene) {
            scene = scene || {};
            var entities = scene.entities || [];
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].isListeningFor('keydown')) {
                    entities[i].trigger('keydown', {
                        event: event
                    });
                }
            }
        }
    };

}();