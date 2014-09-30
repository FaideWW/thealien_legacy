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
                this.fill        = options.fill   || null;
                this.stroke      = options.stroke || null;
            }

            return SquareRenderable;
        }()),
        TextRenderable = (function () {
            function TextRenderable(options) {
                if (!(this instanceof TextRenderable)) {
                    return new TextRenderable(options);
                }
                options = options || {};

                this.type = "text";

                // accept bare string as parameter
                this.text   = (options.text) ? options.text : options;
                this.fill   = options.fill   || null;
                this.stroke = options.stroke || null;
                this.font   = options.font   || null;
            }

            return TextRenderable;
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
        AABBCollidable = (function () {
            function AABBCollidable(options) {
                if (!(this instanceof AABBCollidable)) {
                    return new AABBCollidable(options);
                }

                this.type = "aabb";
                this.collidedX = false;
                this.collidedY = false;
                this.collided  = false;

                this.collision_data = {};

                options = options || {};
                this.half_width  = options.half_width  || 0;
                this.half_height = options.half_height || 0;
                this.reaction = options.reaction       || "bounce";
            }

            return AABBCollidable;
        }()),
        Velocity = (function() {
            function Velocity(options) {
                if (!(this instanceof Velocity)) {
                    return new Velocity(options);
                }

                options = options || {};
                this.x = options.x || 0;
                this.y = options.y || 0;
            }

            return Velocity;
        }()),
        PaddleController = (function() {
            function PaddleController(options) {
                if (!(this instanceof PaddleController)) {
                    return new PaddleController(options);
                }

                options = options || {};

                this.type = "paddle";
                this.direction = options.direction || "y";
            }

            return PaddleController;
        }()),
        MouseController = (function () {
            function MouseController(options) {
                if (!(this instanceof MouseController)) {
                    return new MouseController(options);
                }

                this.type = "mouse";
            }
            return MouseController;
        }()),
        Type = (function () {
            function Type(options) {
                if (!(this instanceof Type)) {
                    return new Type(options);
                }

                this.type = options.type || null;
            }
            return Type;
        }());


    return {
        square_renderable: SquareRenderable,
        text_renderable:   TextRenderable,
        position:          Position,
        rotation:          Rotation,
        translation:       Translation,
        orbital:           Orbital,
        aabb_collidable:   AABBCollidable,
        velocity:          Velocity,
        paddle_controller: PaddleController,
        mouse_controller:  MouseController,
        type:              Type
    };
});