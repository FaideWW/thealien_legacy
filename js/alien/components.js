/**
 * Created by faide on 2014-09-05.
 */

'use strict';

define([], function () {
    var SquareRenderable = (function () {
            function SquareRenderable(options) {
                if (!(this instanceof SquareRenderable)) {
                    return new SquareRenderable(options);
                }
                options = options || {};
                this.type   = "square";
                this.half_width  = options.half_width  || 25;
                this.half_height = options.half_height || 25;
                this.fill        = options.fill   || "rgba( 0,255, 0, 1 )";
                this.stroke      = options.stroke || "rgba( 0,  0, 0, 1 )";
            }

            return SquareRenderable;
        }()),
        Position = (function () {
            function Position(options) {
                if (!(this instanceof Position)) {
                    return new Position(options);
                }
                options = options || {};
                this.x = options.x || 0;
                this.y = options.y || 0;
            }

            return Position;
        }()),
        Rotation = (function () {
            function Rotation(options) {
                if (!(this instanceof Rotation)) {
                    return new Rotation(options);
                }

                options = options || {};
                this.angle = options.angle || 0;
            }

            return Rotation;
        }()),
        Translation = (function () {
            function Translation(options) {
                if (!(this instanceof Translation)) {
                    return new Translation(options);
                }

                options = options || {};
                this.x = options.x || 0;
                this.y = options.y || 0;
            }

            return Translation;
        }()),
        Orbital = (function () {
            function Orbital(options) {
                if (!(this instanceof Orbital)) {
                    return new Orbital(options);
                }

                options = options || {};
                this.radius = options.radius || 50;
            }
            return Orbital;
        }()),
        Collidable = (function () {
            function Collidable(options) {
                if (!(this instanceof Collidable)) {
                    return new Collidable(options);
                }

                options = options || {};
                this.half_width  = options.half_width  || 0;
                this.half_height = options.half_height || 0;
            }

            return Collidable;
        }()),
        Velocity = (function() {
            function Velocity(options) {
                if (!(this instanceof Velocity)) {
                    return new Velocity(options);
                }

                options = options || {};
                this.x = options.x;
                this.y = options.y;
            }

            return Velocity;
        }());


    return {
        square_renderable: SquareRenderable,
        position:          Position,
        rotation:          Rotation,
        translation:       Translation,
        orbital:           Orbital,
        collidable:        Collidable,
        velocity:          Velocity
    };
});