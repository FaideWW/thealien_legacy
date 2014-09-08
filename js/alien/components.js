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
                this.width  = options.width  || 50;
                this.height = options.height || 50;
                this.fill   = options.fill   || "rgba( 0,255, 0, 1 )";
                this.stroke = options.stroke || "rgba( 0,  0, 0, 1 )";
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
        }());


    return {
        square_renderable: SquareRenderable,
        position: Position
    };
});