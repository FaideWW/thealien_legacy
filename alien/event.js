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

    function pointInPoly(point, poly) {
        var xs = [],
            ys = [];
        for (var i = 0; i < poly.length; i += 1) {
            xs.push(poly[i].x);
            ys.push(poly[i].y);
        }
        var minx = alien.Math.min(xs),
            miny = alien.Math.min(ys),
            maxx = alien.Math.max(xs),
            maxy = alien.Math.max(ys);

        return (point.x > minx && point.x < maxx &&
                point.y > miny && point.y < maxy);
    }

    return {
        click: function(event, scene) {
            scene = scene || {};
            var entities = scene.entities || [];
            for (var i = 0; i < entities.length; i += 1) {
                if (entities[i].isListeningFor('click') && pointInPoly({ x: event.layerX - entities[i].position.x, y: event.layerY - entities[i].position.y }, entities[i].polygon.points)) {
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
                if (entities[i].isListeningFor('dblclick') &&  pointInPoly({ x: event.layerX - entities[i].position.x, y: event.layerY - entities[i].position.y }, entities[i].polygon.points)) {
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
                if (entities[i].isListeningFor('mousedown') &&  pointInPoly({ x: event.layerX - entities[i].position.x, y: event.layerY - entities[i].position.y }, entities[i].polygon.points)) {
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
                if (entities[i].isListeningFor('mouseover') &&  pointInPoly({ x: event.layerX - entities[i].position.x, y: event.layerY - entities[i].position.y }, entities[i].polygon.points)) {
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
                if (entities[i].isListeningFor('mouseout') &&  pointInPoly({ x: event.layerX - entities[i].position.x, y: event.layerY - entities[i].position.y }, entities[i].polygon.points)) {
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