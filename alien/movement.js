/**
 * alien.components.movement
 */

var alien = alien || {};

alien.components.movement = (function() {
    'use strict';

    var pi2 = Math.PI * 2;

    var movement = {
        CircleAround: (function() {
            'use strict';

        
            function CircleAround(args) {
                // enforces new
                if (!(this instanceof CircleAround)) {
                    return new CircleAround(args);
                }
                this.anchor = args.anchor || "root";
                this.radius = args.radius || 20;
                this.period = args.period || 2000;
                this.lastPosition = new alien.Math.Vector();
                this.currTime = 0;
            }
        
            CircleAround.prototype.update = function(e, dt) {
                this.currTime = (this.currTime + dt) % this.period;
                var interpolation = (this.currTime / this.period) * pi2;

                var newPosition = new alien.Math.Vector({
                    x: Math.cos(interpolation),
                    y: Math.sin(interpolation)
                });

                var anchor_position = this.anchor;
                if (this.anchor === "root") {
                    anchor_position = e.getPosition();
                }

                //e.setPosition(anchor.getPosition().add(newPosition.sub(this.lastPosition)));

                return anchor_position.add(newPosition.sub(this.lastPosition));

                this.lastPosition = newPosition;
            }
        
            return CircleAround;
        
        }())
    }

    return movement;

}());

alien.components.Movement = (function() {
    'use strict';

    function Movement(args) {
        // enforces new
        if (!(this instanceof Movement)) {
            return new Movement(args);
        }
        this.anchor = args.anchor || "root";

    }

    Movement.prototype.methodName = function(args) {
        // method body
    }

    return Movement;

}());