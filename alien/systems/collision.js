var alien = alien || {};
alien.systems = alien.systems || {};

alien.systems.CollisionSystem = (function () {
    'use strict';

    var CollisionSystem = {

        tests: {
            AABBTest: 0
        },

        0: function(c1, c2) { //AABBTest
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
            if (!(e1.hasOwnProperty('collidable') && e2.hasOwnProperty('collidable'))) {
                return 0;
            }
            return this[Math.max(this.tests[e1.collidable.preferredTest], this.tests[e2.collidable.preferredTest])](e1.collidable.offset(e1.position), e2.collidable.offset(e2.position));

        },
    };

    return CollisionSystem;

}());
