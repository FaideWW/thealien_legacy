var alien = alien || {};

alien.EventManager = function() {
    return {
        click: function(event, scene) {
            var entities = scene.entities;
            for (var k = 0; k < entities.length; k++) {
                if (entities[k].isListeneingFor('click')) {
                    entities[k].trigger('click', {
                        event: event
                    });
                }
            }
        },
        dblclick: function(event, scene) {
            var entities = scene.entities;
            for (var k = 0; k < entities.length; k++) {
                if (entities[k].isListeningFor('dblclick')) {
                    entities[k].trigger('dblclick', {
                        event: event
                    });
                }
            }
        },
        mousedown: function(event, scene) {
            var entities = scene.entities;
            for (var k = 0; k < entities.length; k++) {
                if (entities[k].isListeningFor('mousedown')) {
                    entities[k].trigger('mousedown', {
                        event: event
                    });
                }
            }
        },
        mouseup: function(event, scene) {
            var entities = scene.entities;
            for (var k = 0; k < entities.length; k++) {
                if (entities[k].isListeningFor('mouseup')) {
                    entities[k].trigger('mouseup', {
                        event: event
                    });
                }
            }
        },
        mouseover: function(event, scene) {
            var entities = scene.entities;
            for (var k = 0; k < entities.length; k++) {
                if (entities[k].isListeningFor('mouseover')) {
                    entities[k].trigger('mouseover', {
                        event: event
                    });
                }
            }
        },
        mouseout: function(event, scene) {
            var entities = scene.entities;
            for (var k = 0; k < entities.length; k++) {
                if (entities[k].isListeningFor('mouseout')) {
                    entities[k].trigger('mouseout', {
                        event: event
                    });
                }
            }
        },
        keyup: function(event, scene) {
            var entities = scene.entities;
            for (var k = 0; k < entities.length; k++) {
                if (entities[k].isListeningFor('keyup')) {
                    entities[k].trigger('keyup', {
                        event: event
                    });
                }
            }
        },
        keydown: function(event, scene) {
            var entities = scene.entities;
            for (var k = 0; k < entities.length; k++) {
                if (entities[k].isListeningFor('keydown')) {
                    entities[k].trigger('keydown', {
                        event: event
                    });
                }
            }
        }
    }
}();