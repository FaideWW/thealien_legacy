/**
 * Created by faide on 2014-04-23.
 */

define(['underscore', 'alien/utilities/math'], function (_, M) {
    "use strict";
    var MovableFactory = (function () {
        return {
            createMovable: function (hasGravity, velocity, acceleration) {
                return {
                    velocity:     velocity || new M.Vector(),
                    acceleration: acceleration || new M.Vector(),
                    hasGravity:   hasGravity || false,
                    onGround:     false,
                    jump:         0
                };
            }
        };
    }());
    return MovableFactory;
});