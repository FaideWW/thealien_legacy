var alien = alien || {};
alien.systems = alien.systems || {};


alien.systems.EventSystem = function() {

    var mouse_events = [
        'click',
        'dblclick',
        'mousedown',
        'mouseup',
        'mousemove',
        'mouseover',
        'mouseout'
    ],
        key_events = [
        'keydown',
        'keyup',
        'keypress'
    ];

    var isDragEvent = false,
        deltaDrag = new alien.Math.Vector(),
        maxDelta = 5;

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

    alien.Game.prototype.registerEventListeners = function(canvas, scene) {
        var e;
            for (e in alien.systems.EventSystem) {
                if (alien.systems.EventSystem.hasOwnProperty(e)) {
                    if (mouse_events.indexOf(e) !== -1) {
                        this.canvas.addEventListener(e, function(ev) {
                            alien.systems.EventSystem[ev.type](ev, scene);
                        });
                    } else if (key_events.indexOf(e) !== -1) {
                        document.addEventListener(e, function(ev) {
                            alien.systems.EventSystem[ev.type](ev, scene);
                        });
                    }
                }
            }
    };

    alien.Entity.default_properties.listeners = {};
    alien.Entity.default_properties.propagateMouseEvents = false;
    alien.Entity.default_properties.globallyListeningFor = {
        'click': false,
        'dblclick': false,
        'mousedown': false,
        'mouseup': false,
        'mousemove': false,
        'mouseover': false,
        'mouseout': false
    };

    function entitiesAtPoint(point, scene, e_type) {
        var entities = scene.entities || [],
            entities_at_point = [];

        for (var i = entities.length - 1; i >= 0; i -= 1) {
            if (entities[i].hasOwnProperty('collidable')) {
                if (entities[i].collidable.pointIn(point.sub(entities[i].position))) {
                    entities_at_point.push(entities[i]);
                    if (!entities[i].propagateMouseEvents) {
                        break;
                    }
                }
            }
        }

        if (entities_at_point.length < 1) {
            for (var k = 0; k < entities.length; k++) {
                if (entities[k].globallyListeningFor[e_type]) {
                    entities_at_point.push(entities[k]);
                }
            }
        }
        return entities_at_point;
    }

    return {
        click: function(event, scene) {
            if (!isDragEvent) {
                scene = scene || {};
                var entities = entitiesAtPoint(new alien.Math.Vector({ x: event.layerX, y: event.layerY }), scene, 'click');
                for (var i = 0; i < entities.length; i += 1) {
                    entities[i].trigger('click', {
                        event: event
                    });
                }
            }
            isDragEvent = false;
        },
        dblclick: function(event, scene) {
            scene = scene || {};
            var entities = entitiesAtPoint(new alien.Math.Vector({ x: event.layerX, y: event.layerY }), scene, 'dblclick');
            for (var i = 0; i < entities.length; i++) {
                entities[i].trigger('dblclick', {
                    event: event
                });
            }
        },
        mousedown: function(event, scene) {
            scene = scene || {};
            var entities = entitiesAtPoint(new alien.Math.Vector({ x: event.layerX, y: event.layerY }), scene, 'mousedown');
            for (var i = 0; i < entities.length; i++) {
                entities[i].trigger('mousedown', {
                    event: event
                });
            }
            deltaDrag.x = event.layerX;
            deltaDrag.y = event.layerY;
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
            deltaDrag = deltaDrag.sub(new alien.Math.Vector({
                x: event.layerX,
                y: event.layerY
            }));
            if (deltaDrag.mag() > maxDelta) {
                isDragEvent = true;
            }
            deltaDrag = new alien.Math.Vector();
        },
        mouseover: function(event, scene) {
            scene = scene || {};
            var entities = entitiesAtPoint(new alien.Math.Vector({ x: event.layerX, y: event.layerY }), scene, 'mouseover');
            for (var i = 0; i < entities.length; i++) {
                entities[i].trigger('mouseover', {
                    event: event
                });
            }
        },
        mouseout: function(event, scene) {
            scene = scene || {};
            var entities = entitiesAtPoint(new alien.Math.Vector({ x: event.layerX, y: event.layerY }), scene, 'mouseout');
            for (var i = 0; i < entities.length; i++) {
                entities[i].trigger('mouseout', {
                    event: event
                });
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