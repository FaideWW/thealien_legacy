var alien = alien || {};

alien.RenderSystem = (function () {
    'use strict';

    var RenderSystem = {
        draw: function (canvas, scene) {
            var c = canvas.getContext('2d'),
                i,
                pos;
            c.clearRect(0, 0, canvas.width, canvas.height);

            for (i = 0; i < scene.entities.length; i += 1) {
                //if the entity has a position, grab it; otherwise set to origin
                pos = scene.entities[i].position || new alien.Math.Vector();
                //trigger a draw event with the position and context
                scene.entities[i].trigger('draw', {
                    context: c,
                    position: pos
                });
            }
        }
    };

    return RenderSystem;

}());
