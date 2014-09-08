/**
 * Created by faide on 2014-09-05.
 */

'use strict';

define([], function () {
    var Renderable = (function () {
            function Renderable(options) {
                if (!(this instanceof Renderable)) {
                    return new Renderable(options);
                }
                options = options || {};
                this.isRenderable = true;
            }

            return Renderable;
        }()),
        Position = (function () {
            function Position(options) {
                if (!(this instanceof Position)) {
                    return new Position(options);
                }
                options = options || {};
                this.isPosition = true;
            }

            return Position;
        }());


    return {
        renderable: Renderable,
        position: Position
    };
});