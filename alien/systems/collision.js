var alien = alien || {};
alien.systems = alien.systems || {};

alien.systems.CollisionSystem = (function () {
    'use strict';

    var CollisionSystem = {

        AABBTest: function(c1, c2) {
            //debugger;
            if ((c1.origin.x + c1.half_width) > (c2.origin.x - c2.half_width) && (c1.origin.x - c1.half_width) < c2.origin.x - c2.half_width) {
                if ((c1.origin.y + c1.half_height) > (c2.origin.y - c2.half_height) && (c1.origin.y - c1.half_height) < (c2.origin.y - c2.half_height)) {
                    //collision at c1's southeast corner
                    if (((c1.origin.y + c1.half_height) - (c2.origin.y - c2.half_height)) < ((c1.origin.x + c1.half_width)) - ((c2.origin.x - c2.half_width))) {
                        //y collision
                        return new alien.Math.Vector({
                            y: ((c1.origin.y + c1.half_height) - (c2.origin.y - c2.half_height))
                        });
                    } else {
                        //x collision
                        return new alien.Math.Vector({
                            x: (c1.origin.x + c1.half_width) - (c2.origin.x - c2.half_width)
                        });
                    }
                } else if ((c1.origin.y - c1.half_height) < (c2.origin.y + c2.half_height) && (c1.origin.y + c1.half_height) > (c2.origin.y - c2.half_height)) {
                    //collision at c1's northeast corner
                    if (((c2.origin.y + c2.half_height) - (c1.origin.y - c1.half_height)) < ((c1.origin.x + c1.half_width)) - ((c2.origin.x - c2.half_width))) {
                        //-y collision
                        return new alien.Math.Vector({
                            y: -((c2.origin.y + c2.half_height) - (c1.origin.y - c1.half_height))
                        });
                    } else {
                        //x collision
                        return new alien.Math.Vector({
                            x: (c1.origin.x + c1.half_width) - (c2.origin.x - c2.half_width)
                        });
                    }
                } else {
                    return 0;
                }
            } else if ((c1.origin.x - c1.half_width) < (c2.origin.x + c2.half_width) && (c1.origin.x + c1.half_width) > (c2.origin.x - c2.half_width)) {
                if ((c1.origin.y + c1.half_height) > (c2.origin.y - c2.half_height) && (c1.origin.y - c1.half_height) < (c2.origin.y - c2.half_height)) {
                    //collision at c1's southwest corner
                    if (((c1.origin.y + c1.half_height) - (c2.origin.y - c2.half_height)) < ((c2.origin.x + c2.half_width) - (c1.origin.x - c1.half_width))) {
                        //y collision
                        return new alien.Math.Vector({
                            y: ((c1.origin.y + c1.half_height) - (c2.origin.y - c2.half_height))
                        });
                    } else {
                        //-x collision
                        return new alien.Math.Vector({
                            x: -((c2.origin.x + c2.half_width) - (c1.origin.x - c1.half_width))
                        });
                    }
                } else if ((c1.origin.y - c1.half_height) < (c2.origin.y + c2.half_height) && (c1.origin.y + c1.half_height) > (c2.origin.y - c2.half_height)) {
                    //collision at c1's northwest corner
                    if (((c2.origin.y + c2.half_height) - (c1.origin.y - c1.half_height)) < ((c2.origin.x + c2.half_width) - (c1.origin.x - c1.half_width))) {
                        //-y collision
                        return new alien.Math.Vector({
                            y: -((c2.origin.y + c2.half_height) - (c1.origin.y - c1.half_height))
                        });
                    } else {
                        //-x collision
                        return new alien.Math.Vector({
                            x: -((c2.origin.x + c2.half_width) - (c1.origin.x - c1.half_width))
                        });
                    }
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        },

        collide: function (e1, e2) {
            for (var i = 0; i < e1.collidables.length; i += 1) {
                for (var j = 0; j < e2.collidables.length; j +=  1) {
                    
                }
            } 
            return false;
        },
    };

    alien.Entity.default_properties.collidables = [];

    return CollisionSystem;

}());
