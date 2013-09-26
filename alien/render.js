var alien = alien || {};

alien.RenderSystem = (function () {
    'use strict';

    var RenderSystem = {
        draw: function (canvas, scene) {
            var c = canvas.getContext('2d'),
            i;
            c.clearRect(0, 0, canvas.width, canvas.height);

            for (i = 0; i < scene.entities.length; i += 1) {
                //if the entity has a position, grab it; otherwise set to origin
                //trigger a draw event with the position and context
                scene.entities[i].trigger('draw', {
                    context: c,
                    position: scene.entities[i].position
                });
            }
        }
    };

    alien.Entity.prototype.position = alien.Entity.prototype.position || new alien.Math.Vector();
    alien.Entity.prototype.polygon = {
        color: "rgba(0,0,0,1)",
        points: [{
            x: 0,
            y: 0
        }]
    };

    alien.Entity.prototype.on('draw', function(e, props) {
        if (e.hasOwnProperty('polygon')) {
            var c = props.context,
            p = props.position,
            i;
            c.fillStyle = e.polygon.color;
            c.beginPath();
            c.moveTo(p.x + e.polygon.points[0].x, p.y + e.polygon.points[0].y);
            for (i = 1; i < e.polygon.points.length; i += 1) {
                c.lineTo(p.x + e.polygon.points[i].x, p.y + e.polygon.points[i].y);
            }
            c.closePath();
            c.fill();
        }
    });

    return RenderSystem;

}());
