/**
 * Created by faide on 2014-04-20.
 */

define(['underscore', 'alien/utilities/math'], function (_, M) {
    'use strict';

    /**
     * CollidableFactory produces duck-typed data structures for collision detection
     */
    var CollidableFactory = (function () {
        var collidables = {
            CIRCLE: -1,
            AABB:    0,
            POLYGON: 1
        };
        return {
            /* Collidable enum */
            collidables: collidables,
            createBoundingCircle: function (radius) {
                return {
                    type: collidables.CIRCLE,
                    radius: radius
                };
            },
            createAABB: function (half_width, half_height) {
                return {
                    type: collidables.AABB,
                    half_width: half_width,
                    half_height: half_height,
                    /* Collidable faces wind clockwise from WEST to SOUTH */
                    faces: [0, 0, 0, 0]
                };
            },
            createBoundingPolygon: function (poly, hook) {
                var p;
                if (poly instanceof M.Polygon) {
                    p = new M.Polygon(poly);
                } else if (poly.length) {
                    p = new M.Polygon({points: poly});
                } else {
                    p = new M.Polygon(poly);
                }
                /* Collidable faces wind clockwise in the order determined by the points */
                p.faces = _.map(p.points, function () { return 0; });
                p.type = collidables.POLYGON;
                p.hook = hook;
                return p;
            }
        };
    }());
    return CollidableFactory;
});