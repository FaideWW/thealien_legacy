var alien = alien || {};



alien.EventManager = function() {
    return {
        click: function(event, scene) {
            console.log('hai');
            scene = scene || {};
            var entities = scene.entities || [];
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].isListeneingFor('click')) {
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