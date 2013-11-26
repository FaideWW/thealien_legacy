define(["../math", "../game"], function(AlienMath, Game) {
    /**
     * alien.systems.CollisionSystem
     *
     * properties
     * ~ none
     * 
     * methods
     * ~ CollisionSystem.AABBTest ( c1 : alien.components.collidable.AABB, 
     *                              c2 : alien.components.collidable.AABB )
     *      - Performs an axis aligned bounding box test which measures the
     *        overlap (or lack thereof) of two AABBs.  If no overlap is found,
     *        returns 0.  If there is overlap, returns an AlienMath.Vector
     *        designating the direction and depth of the shallowest overlap.
     *
     *      - This test is very fast and should be performed first whenever 
     *        possible (if AABBTest returns false, there is no way a more 
     *        precise test can return true)
     *
     * ~ CollisionSystem.SeparatingAxisTheorem ( c1 : alien.components.collidable,
     *                                           c2 : alien.components.collidable )
     *      - Performs a separating axis test on two collidable polygons.
     *        This test determines whether or not the two polygons are sufficiently
     *        far apart such that an axis can be derived that does not intersect
     *        either.  According to the Separating Axis Theorem, if such an axis
     *        can be found, the two polygons do not intersect.  This returns 0 if
     *        no intersection is found, or AlienMath.Vector denoting direction and
     *        depth of shallowest intersection.
     *
     *      - This test is also quite fast due to early exclusion (only one axis
     *        needs to be found), but not as fast as AABB
     *
     * ~ CollisionSystem.collide ( e1 : alien.Entity, e2 : alien.Entity )
     *      - hub function that determines the least expensive collision test
     *        that can be performed according to the provided Entity's colliders
     *        and their preferred test, then returns the result of that function.
     * 
     * CollisionSystem is a container for the multiple collision tests that are
     *  performed on entities.  This is a very math-heavy portion of the code, so
     *  explanations of methods are given as generally as possible.
     *
     * todo
     * - efficient spatial partitioning using BSP trees
     * - broad-phase sweeping for more efficient possible collision searching
     * - ray-casting intersection algorithm
     * - pre/post physics update collision interpolation
     * - velocity-bound volume collision (for colliding two moving entities)
     * 
     */

    var CollisionSystem = (function () {
        'use strict';

        var CollisionSystem = {

            AABBTest: function(c1,c2) {
                return this[0](c1,c2);
            },

            SeparatingAxisTheorem: function(c1,c2) {
                return this[1](c1,c2);
            },

            tests: {
                AABBTest: 0,
                SeparatingAxisTheorem: 1
            },

            numTests: 0,

            0: function(c1, c2) { //AABBTest
                //debugger;
                if ((c1.origin.x + c1.half_width) > (c2.origin.x - c2.half_width) && (c1.origin.x - c1.half_width) < c2.origin.x - c2.half_width) {
                    if ((c1.origin.y + c1.half_height) > (c2.origin.y - c2.half_height) && (c1.origin.y - c1.half_height) < (c2.origin.y - c2.half_height)) {
                        //collision at c1's southeast corner
                        if (((c1.origin.y + c1.half_height) - (c2.origin.y - c2.half_height)) < ((c1.origin.x + c1.half_width)) - ((c2.origin.x - c2.half_width))) {
                            //y collision
                            return new AlienMath.Vector({
                                y: ((c1.origin.y + c1.half_height) - (c2.origin.y - c2.half_height))
                            });
                        } else {
                            //x collision
                            return new AlienMath.Vector({
                                x: (c1.origin.x + c1.half_width) - (c2.origin.x - c2.half_width)
                            });
                        }
                    } else if ((c1.origin.y - c1.half_height) < (c2.origin.y + c2.half_height) && (c1.origin.y + c1.half_height) > (c2.origin.y - c2.half_height)) {
                        //collision at c1's northeast corner
                        if (((c2.origin.y + c2.half_height) - (c1.origin.y - c1.half_height)) < ((c1.origin.x + c1.half_width)) - ((c2.origin.x - c2.half_width))) {
                            //-y collision
                            return new AlienMath.Vector({
                                y: -((c2.origin.y + c2.half_height) - (c1.origin.y - c1.half_height))
                            });
                        } else {
                            //x collision
                            return new AlienMath.Vector({
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
                            return new AlienMath.Vector({
                                y: ((c1.origin.y + c1.half_height) - (c2.origin.y - c2.half_height))
                            });
                        } else {
                            //-x collision
                            return new AlienMath.Vector({
                                x: -((c2.origin.x + c2.half_width) - (c1.origin.x - c1.half_width))
                            });
                        }
                    } else if ((c1.origin.y - c1.half_height) < (c2.origin.y + c2.half_height) && (c1.origin.y + c1.half_height) > (c2.origin.y - c2.half_height)) {
                        //collision at c1's northwest corner
                        if (((c2.origin.y + c2.half_height) - (c1.origin.y - c1.half_height)) < ((c2.origin.x + c2.half_width) - (c1.origin.x - c1.half_width))) {
                            //-y collision
                            return new AlienMath.Vector({
                                y: -((c2.origin.y + c2.half_height) - (c1.origin.y - c1.half_height))
                            });
                        } else {
                            //-x collision
                            return new AlienMath.Vector({
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

            1: function(c1, c2) {
                return 0;
            },

            collide: function (e1, e2) {
                if (!(e1.hasOwnProperty('collidable') && e2.hasOwnProperty('collidable'))) {
                    return 0;
                }

                this.numTests += 1;
                return this[Math.max(this.tests[e1.collidable.preferredTest], this.tests[e2.collidable.preferredTest])](e1.collidable.offset(e1.position), e2.collidable.offset(e2.position));

            },
        };

        Game.default_properties.systems.push(CollisionSystem);
        
        return CollisionSystem;

    }());
    return CollisionSystem;
});
