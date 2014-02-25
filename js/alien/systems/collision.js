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

        var depth_tolerance = 0.5;

        function generateAxes(points) {
            //debugger;
            var axes = [],
                i = points.length - 1,
                j;
            for (;i >= 0;i--) {
                j = i - 1;
                if (j < 0) {
                    j = points.length - 1;
                }
                axes.push(new AlienMath.Vector({
                    x: points[j].x - points[i].x,
                    y: points[j].y - points[i].y
                }).unt());
            }
            return axes;
        }

        var CollisionSystem = {

            AABBTest: function(c1,c2) {
                return this[0](c1,c2);
            },

            SeparatingAxisTest: function(c1,c2) {
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
                debugger;
                //generate axes (choose the entity with less sides)
                var collidables1 = c1.collidable.getPoints(),
                    collidables2 = c2.collidable.getPoints(),
                    pos1 = c1.getWorldSpacePosition(),
                    pos2 = c2.getWorldSpacePosition(),
                    axes = generateAxes((collidables1 <= collidables2) ? collidables1 : collidables2),
                    i = axes.length,
                    collision = -1,
                    c_depth, j, axis, projection1, projection2, projection_list1, projection_list2;
                
                // for each axis that we test against
                for (;i>0;i--) {
                    axis = axes[i-1];
                    projection_list1 = [];
                    projection_list2 = [];
                    j = collidables1.length;
                    for (;j > 0; j--) {
                        //project each point from the collidable
                        // (offset by the entity's worldspace position)
                        // onto the axis
                        projection_list1.push(pos1.add(collidables1[j-1]).scalarProject(axis));
                    } 
                    j = collidables2.length;
                    for (;j > 0; j--) {
                        //repeat for the other collidable
                        projection_list2.push(pos2.add(collidables2[j-1]).scalarProject(axis));
                    }
                    //find the intervals that each projection lies on
                    projection1 = {
                        min: AlienMath.min(projection_list1),
                        max: AlienMath.max(projection_list1)
                    };

                    projection2 = {
                        min: AlienMath.min(projection_list2),
                        max: AlienMath.max(projection_list2)
                    };
                    // if there is no intersection of the intervals, then there is no collision
                    if (projection1.min < projection2.min && projection1.max < projection2.min
                     || projection1.max > projection2.max && projection1.min > projection2.max) {
                        return 0;
                    } else {
                        c_depth = (projection1.min < projection2.min) ? (projection1.max - projection2.min) : (projection2.max - projection1.min);
                        if (collision === -1 || (c_depth * c_depth) < collision.magsquared()) {
                            // if this is the shallowest collision depth, that's the axis of collision
                            collision = axis.mul(c_depth);
                        }
                    }
                }
                return collision;

            },

            collide: function (e1, e2) {
                if (!(e1.hasOwnProperty('collidable') && e2.hasOwnProperty('collidable'))) {
                    return 0;
                }

                var result = this[Math.max(this.tests[e1.collidable.preferredTest], this.tests[e2.collidable.preferredTest])](e1.collidable.offset(e1.position), e2.collidable.offset(e2.position));
                if (result.mag && result.mag() < depth_tolerance) {
                    return 0;
                }
                return result;
            },

            testGenAxes: function(entity) {
                return generateAxes(entity.collidable.getPoints());
            }
        };

        Game.default_properties.systems.push(CollisionSystem);
        
        return CollisionSystem;

    }());
    return CollisionSystem;
});
