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
                scene.entities[i].draw({
                    context: c,
                    position: scene.entities[i].position
                });
            }
        }
    };

    alien.Entity.default_properties.position = new alien.Math.Vector();
    alien.Entity.default_properties.polygon = {
        color: "rgba(0,0,0,1)",
        points: [{
            x: 0,
            y: 0
        }]
    };

    alien.Entity.prototype.draw = function(props) {
        if (this.hasOwnProperty('polygon')) {
            var c = props.context,
            p = props.position,
            i;
            c.fillStyle = this.polygon.color;
            c.beginPath();
            c.moveTo(p.x + this.polygon.points[0].x, p.y + this.polygon.points[0].y);
            for (i = 1; i < this.polygon.points.length; i += 1) {
                c.lineTo(p.x + this.polygon.points[i].x, p.y + this.polygon.points[i].y);
            }
            c.closePath();
            c.fill();
        }else{
            this.trigger('draw', props);
        }
    };

    return RenderSystem;

}());
