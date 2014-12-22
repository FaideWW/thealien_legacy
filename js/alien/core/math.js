/**
 * Created by faide on 14-10-05.
 */

"use strict";
define(['lodash'], function (_) {
    /**
     * Most vector operations will accept 2d and 3d vector arguments
     *
     * If a 2d and a 3d vector are passed to an op that requires symmetrical types,
     *  or if a 3d vector is passed into a 2d operation, the 3d vector will be cast
     *  into a 2d vector by discarding the z component
     *
     * exception: the equal() method does not cast between 2D and 3D
     *
     */
    return {
        EPSILON: 2.2204460492503130808472633361816E-16,
        vec2:   function (x, y) {
            // vec2 can be created with an object, or with a tuple
            if (typeof x === 'object' && !(isNaN(x.x) || isNaN(x.y))) {
                // copy constructor
                return {
                    x: x.x,
                    y: x.y
                };
            }

            if (!(isNaN(x) || isNaN(y))) {
                return {
                    x: x,
                    y: y
                };
            }

            if (x === undefined || y === undefined) {
                return {
                    x: x || 0,
                    y: y || 0
                };
            }

            throw new Error('Invalid parameters (' + x + ',' + y + ')');
        },

        isVec2: function (v) {
            return (v && !(isNaN(v.x) || isNaN(v.y)));
        },

        vec3: function (x, y, z) {
            if (this.isVec2(x)) {
                return {
                    x: x.x,
                    y: x.y,
                    z: 0
                };
            }
            if (typeof x === 'object' && !(isNaN(x.x) || isNaN(x.y) || isNaN(x.z))) {
                return x;
            }

            if (!(isNaN(x) || isNaN(y) || isNaN(z))) {
                return {
                    x: x,
                    y: y,
                    z: z || 0
                }
            }

            if (x === undefined || y === undefined || z === undefined) {
                return {
                    x: x || 0,
                    y: y || 0,
                    z: z || 0
                };
            }

            throw new Error('Invalid parameters (' + x + ',' + y + ')');
        },

        isVec3: function (v) {
            return (v && !(isNaN(v.x) || isNaN(v.y) || isNaN(v.z)));
        },

        polygon: function (points) {
            if (this.isPolygon(points)) {
                return {
                    points: points.points
                };
            }

            if (points) {
                if (points.points) {
                    return {
                        points: points.points
                    };
                } else if (points.half_width && points.half_height) {
                    return {
                        points: [
                            this.rotate(this.vec2(-points.half_width, -points.half_height), (points.rotation || 0)),
                            this.rotate(this.vec2( points.half_width, -points.half_height), (points.rotation || 0)),
                            this.rotate(this.vec2( points.half_width,  points.half_height), (points.rotation || 0)),
                            this.rotate(this.vec2(-points.half_width,  points.half_height), (points.rotation || 0)),
                        ]
                    };
                } else if (points.length) {
                    return {
                        points: points
                    }
                } else if (arguments.length > 1) {
                    return {
                        points: Array.prototype.slice.call(arguments, 0)
                    };
                }
            }

            return {
                points: []
            };

        },
        isPolygon: function (p) {
            return (p && p.points && p.points.length && _.every(p.points, function (point) { return this.isVec2(point); }, this));
        },
        equal: function (v1, v2) {
            if (this.isVec3(v1) && this.isVec3(v2)) {
                return (v1.x === v2.x &&
                v1.y === v2.y &&
                v1.z === v2.z);
            } else if (this.isVec2(v1) && this.isVec2(v2)) {
                return (v1.x === v2.x &&
                v1.y === v2.y);
            } else {
                return false;
            }

        },

        add: function (v1, v2) {
            if (this.isVec3(v1) && this.isVec3(v2)) {
                return this.vec3(
                    v1.x + v2.x,
                    v1.y + v2.y,
                    v1.z + v2.z
                );
            }

            return this.vec2(
                v1.x + v2.x,
                v1.y + v2.y
            );
        },

        sub: function (v1, v2) {
            if (this.isVec3(v1) && this.isVec3(v2)) {
                return this.vec3(
                    v1.x - v2.x,
                    v1.y - v2.y,
                    v1.z - v2.z
                );
            }

            return this.vec2(
                v1.x - v2.x,
                v1.y - v2.y
            );
        },
        mul: function (v, s) {
            if (this.isVec3(v)) {
                return this.vec3(
                    v.x * s,
                    v.y * s,
                    v.z * s
                );
            }

            return this.vec2(
                v.x * s,
                v.y * s
            );
        },
        div: function (v, s) {
            return this.mul(v, 1 / s);
        },

        dot: function (v1, v2) {
            if (this.isVec3(v1) && this.isVec3(v2)) {
                return v1.x * v2.x +
                    v1.y * v2.y +
                    v1.z * v2.z;
            }

            return v1.x * v2.x +
                v1.y * v2.y;
        },

        rotate: function (v, rads, axis) {
            if (this.isVec3(v) && this.isVec3(axis)) {
                if (this.magSquared(axis) !== 1) {
                    axis = this.unt(axis);
                }

                // skipping a rotation matrix step,
                // thanks to http://inside.mines.edu/fs_home/gmurray/ArbitraryAxisRotation/
                return this.vec3(
                    (axis.x * (axis.x * v.x + axis.y * v.y + axis.z * v.z) * (1 - Math.cos(rads))) + (v.x * Math.cos(rads)) + (((-1 * axis.z * v.y) + (axis.y * v.z)) * Math.sin(rads)),
                    (axis.y * (axis.x * v.x + axis.y * v.y + axis.z * v.z) * (1 - Math.cos(rads))) + (v.y * Math.cos(rads)) + (((     axis.z * v.x) - (axis.x * v.z)) * Math.sin(rads)),
                    (axis.z * (axis.x * v.x + axis.y * v.y + axis.z * v.z) * (1 - Math.cos(rads))) + (v.z * Math.cos(rads)) + (((-1 * axis.y * v.x) + (axis.x * v.y)) * Math.sin(rads))
                );
            }

            // assume in 2d, axis is <0,0,1> (the z axis)
            return this.vec2(
                v.x * Math.cos(rads) - v.y * Math.sin(rads),
                v.x * Math.sin(rads) + v.y * Math.cos(rads)
            );
        },

        normal: function (v, cw) {
            return (cw) ? this.vec2(v.y, -v.x) : this.vec2(-v.y, v.x);
        },

        magSquared: function (v) {
            if (this.isVec3(v)) {
                return v.x * v.x +
                    v.y * v.y +
                    v.z * v.z;
            }

            return v.x * v.x +
                v.y * v.y;
        },

        mag: function (v) {
            return Math.sqrt(this.magSquared(v));
        },

        unt: function (v) {
            var m = this.mag(v);
            if (this.isVec3(v)) {
                return this.vec3(
                    v.x / m,
                    v.y / m,
                    v.z / m
                );
            }

            return this.vec2(
                v.x / m,
                v.y / m
            );
        },

        cross: function (v1, v2) {
            if (this.isVec3(v1) && this.isVec3(v2)) {
                return this.vec3(
                    v1.y * v2.z - v2.y * v1.z,
                    v1.x * v2.z - v2.x * v1.z,
                    v1.x * v2.y - v2.x * v1.y
                );
            }

            // magnitude of the 3d cross product given two 2d vectors assumed to have z = 0 in 3d space
            return (v1.x * v2.y) - (v2.x * v1.y);
        },

        tripleProduct: function (v1, v2, v3) {
            var ac = v1.x * v3.x + v1.y * v3.y,
                bc = v2.x * v3.x + v2.y * v3.y;

            return this.vec2(
                v2.x * ac - v1.x * bc,
                v2.y * ac - v1.y * bc
            );
        },

        scalarProject: function (v1, v2) {
            /**
             *               v1 . v2
             * returns v1' = -------
             *                 |v2|
             */
            return (this.dot(v1, v2) / this.mag(v2));
        },

        vectorProject: function (v1, v2) {
            /**
             *               v1 . v2
             * returns v1' = ------- * v2
             *               v2 . v2
             */
            return (this.mul(v2, (this.dot(v1, v2) / this.dot(v2, v2))));
        },

        vectorReject: function (v1, v2) {
            /**
             * returns v1'' = v1 - v1'
             */
            return this.sub(v1, this.vectorProject(v1, v2));
        },

        clamp: function (i, min, max) {
            return Math.min(Math.max(i, min), max);
        },

        /**
         Returns the scalar parameters t and u where there exists an
         intersection between <p, p + r> and <q, q + s>:

         p + (t)r = q + (u)s

         or (-1, -1) if the lines are parallel/colinear.

         note that an intersection only exists if 0 <= t <= 1 and 0 <= u <= 1
         */
        lineIntersection: function (p, q, p_plus_r, q_plus_s) {
            // t = ((q - p) x s) / (r x s)
            var r = this.sub(p_plus_r, p),
                s = this.sub(q_plus_s, q),
                q_minus_p = this.sub(q, p),
                r_cross_s = this.cross(r, s),
                q_minus_p_cross_s = this.cross( q_minus_p, s),
                q_minus_p_cross_r = this.cross( q_minus_p, r),

                t = q_minus_p_cross_s / r_cross_s,
                u = q_minus_p_cross_r / r_cross_s;

            if (r_cross_s === 0) {
                // lines are either colinear or parallel, discard
                t = -1;
                u = -1;
            }

            return {
                t: t,
                u: u
            };
        },
        /**
         * Simpler version of the ray cast algorithm
         */
        pointInPolygon: function (polygon, position, point) {
            point = point || this.vec2();
            var raycast = this.rayCast(polygon, (this.sub(position, point)));

            return raycast.count % 2 === 1;
        },

        /**
         * Returns the number of times a ray (beginning from the origin), or -1 if the polygon is invalid
         * @param polygon
         * @param position
         * @param ray
         */
        rayCast: function (polygon, position, ray, rayOrigin) {
            var points, max_x, r, r0, count = -1, i, l, edge, intersection, point, t;

            if (this.isPolygon(polygon) && this.isVec2(position)) {


                points = polygon.points;
                l = points.length;

                max_x = position.x + _.max(polygon.points, function (p) { return p.x; }).x;
                r = (this.isVec2(ray)) ? ray : this.vec2(max_x + 1, 0);
                r0 = (this.isVec2(rayOrigin)) ? rayOrigin : this.vec2();

                count    = 0;
                t        = Infinity;
                point    = this.vec2();

                for (i = 0; i < l; i += 1) {
                    edge = {
                        source: this.add(position, points[i]),
                        dest:   this.add(position, points[(i + 1) % l])
                    };

                    intersection = this.lineIntersection(r0, edge.source, r, edge.dest);

                    // we use the asymmetric non-inclusive range (0,1] because of cases where a ray intersecting
                    // exactly with a vertex would cause edges on both sides of the vertex to register
                    // an intersection.  this solves it by discarding results that match the case where
                    // t = 0 and then t = 1 immediately afterwards. may require better solution later
                    if (intersection.t > 0 && intersection.t <= 1 &&
                        intersection.u > 0 && intersection.u <= 1) {
                        count += 1;

                        if (intersection.t < t) {
                            t     = intersection.t;
                            point = this.mul(r, t);
                        }

                    }
                }

            } else {
                console.error('Invalid polygon');
            }

            return {
                count: count,
                t:     t,
                point: point
            };

        },

        // returns a separating vector (magnitude can be calculated if necessary)
        pointLineDistance: function (line, point) {
            var lensq = this.magSquared(this.sub(line.dest, line.source)),
                t, projection;

            point = point || this.vec2();

            if (lensq === 0) {
                // line.dest === line.source
                return this.sub(line.source, point);
            }

            t = this.dot(this.sub(point, line.source), this.sub(line.dest, line.source)) / lensq;

            if (t < 0) {
                return this.sub(line.source, point);
            } else if (t > 1) {
                return this.sub(line.dest, point);
            }

            projection = this.add(line.source, this.mul(this.sub(line.dest, line.source), t));
            return this.sub(projection, point);
        },

        pointPolyDistance: function (poly, position, point) {
            var points, edge, i, l, separationVector, separationDistSq, minimumVector, minimumDistSq;

            if (this.isPolygon(poly)) {
                if (this.pointInPolygon(poly, position, point)) {
                    console.error('point inside polygon');
                    return;
                }
                point = point || this.vec2();
                point = this.sub(point, position);
                points = poly.points;
                l = points.length;


                for (i = 0; i < l; i += 1) {
                    edge = {
                        source: points[i],
                        dest:   points[(i + 1) % l]
                    };

                    separationVector = this.pointLineDistance(edge, point);
                    separationDistSq = this.magSquared(separationVector);

                    if (!minimumDistSq || minimumDistSq > separationDistSq) {
                        minimumDistSq = separationDistSq;
                        minimumVector = separationVector;
                    }

                }

                return minimumVector;
            }
        },
        getEnclosingRect: function (poly) {
            var points, i, l, min_x, min_y, max_x, max_y;

            if (this.isPolygon(poly)) {
                points = poly.points;
                l = points.length;

                for (i = 0; i < l; i += 1) {
                    if (!min_x || points[i].x < min_x) {
                        min_x = points[i].x;
                    }

                    if (!max_x || points[i].x > max_x) {
                        max_x = points[i].x;
                    }

                    if (!min_y || points[i].y < min_y) {
                        min_y = points[i].y;
                    }

                    if (!max_y || points[i].y > max_y) {
                        max_y = points[i].y;
                    }
                }

                return {
                    top_left: this.vec2(min_x, min_y),
                    bottom_right: this.vec2(max_x, max_y)
                };
            }
        },
        /**
         * Adds a vector to every point within a polygon
         * @param poly
         * @param vector
         */
        offset: function (poly, vector) {
            return this.polygon(_.map(poly.points, function (p) { return this.add(p, vector); }, this));
        },

        testGJKBoolean: function (collidable1, collidable2, position1, position2) {
            // OBB-OBB minkowski: via GJK
            // if one of the collidables is an AABB, we cast it to an OBB with 0 rotation

            /**
             GJK algorithm (as I understand it), in 2D

             summarized from https://mollyrocket.com/849

             doSimplex
             - determines the next direction to explore based on the current simplex
             - this calculates the voronoi region of the simplex containing the origin
             using dot products and some clever a priori heuristics to quickly discard
             potential directions
             - in R^2 (2-space), we only need to consider two simplex cases
             - 2-simplex (line): the origin is either closest to the newest support vertex,
             or to the edge formed by the two vertices
             - 3-simplex (triangle): there are four possible outcomes in a simplex formed by points [A,B,C]
             - the origin is closest to the newest support vertex
             - the origin is closest to edge AB
             - the origin is closest to edge AC
             - the simplex encloses the origin (intersection exists)

             the algo:

             A <- support(minkowski, arbitrary direction)
             S <- [A]
             D <- -A

             while (true):
                 A <- support(minkowski, D)
                 if A dot D < 0:
                     // there is no intersection (support vertex cannot enclose the origin)
                     return A
                 else:
                 unshift A to S
                 subroutine doSimplex:
                 if S contains two points:
                     if ((S[1] - S[0]) dot -S[0] > 0): // the origin is closer to the edge than the point
                         // this is the normal vector of the voronoi region we intend to explore next
                         set D <- ((S[1] - S[0]) x -S[0]) x (S[1] - S[0])
                     else: // the origin is closer to the point
                         set S <- [S[0]]
                         set D <- S[0]
                 else if S contains 3 points:
                     if (<0,0,1> x (S[2] - S[0]) dot -S[0] > 0: // testing one edge of the triangle
                         if ((S[2] - S[0]) dot S[0] > 0):
                             set S <- [S[0], S[2]]
                             set D <- (<0,0,1> x (S[2] - S[0]) // edge normal that we produced earlier (a 2D only optimization)
                         else: // star check
                             if (S[1] - S[0]) dot -S[0] > 0:
                                 set S <- [S[0], S[1]]
                                 set D <- ((S[1] - S[0]) x S[0]) x (S[1] - S[0])
                             else:
                                 set S <- [S[0]]
                                 set D <- S[0]
                     else:
                         if ((S[1] - S[0]) x <0,0,1>) dot -S[0] > 0: // star check
                             if (S[1] - S[0]) dot -S[0] > 0:
                                 set S <- [S[0], S[1]]
                                 set D <- ((S[1] - S[0]) x -S[0]) x (S[1] - S[0])
                             else:
                                 set S <- [S[0]]
                                 set D <- S[0]
                         else:
                             // the triangle contains the origin
                             return intersection


             note: we may need to promote 2d vectors into 3-space to take advantage of the cross product auto-choosing
             the correct direction in the edge-closest cases

             */
            var math = this,
                relative_position = math.sub(position2, position1),
                has_collision, poly1, poly2,
                support_function, s, a, b, d, ab, ac, ao, z, edge_normal,
                tolerance;

            poly1 = math.polygon(collidable1);
            poly2 = math.offset(math.polygon(collidable2), relative_position);

            // our Minkowski difference will be (poly2 - poly1)

            /**
             *  Poly-poly support function
             *  returns the vertex in the minkowski difference of the two polygons
             */
            support_function = function (poly1, poly2, direction) {
                var support_subroutine = function (poly, vector) {
                    return _.max(poly.points, function (p) { return math.dot(p, vector) });
                };

                return (math.sub(support_subroutine(poly2, direction), support_subroutine(poly1, math.mul(direction, -1))));
            };

            // the direction here is arbitrary
            a = support_function(poly1, poly2, relative_position);
            d = math.mul(relative_position, -1);
            s = [a];

            tolerance = 0.000001;


            while (true) {
                if (math.magSquared(d) === 0) {
                    d = math.vec2(1, 0);
                }

                // find the new support point
                a = support_function(poly1, poly2, d);
                // if the new point is past the origin in the direction specified
                if (math.dot(a, d) < 0) {
                    // no intersection
                    console.log(s);
                    has_collision = false;
                    break;
                }
                s.unshift(a);

                ao = math.vec3(math.mul(a, -1));
                // check simplex subroutine
                if (s.length === 2) {
                    // 2-simplex
                    ab = math.vec3(math.sub(s[1], s[0]));

                    if (math.dot(ab,ao) > 0) {
                        d = math.tripleProduct(ab, ao, ab);
                    } else {
                        s = [s[0]];
                        d = s[0];
                    }
                } else {
                    // 3-simplex
                    ab = math.vec3(math.sub(s[1], s[0]));
                    ac = math.vec3(math.sub(s[2], s[0]));
                    z  = math.vec3(0,0,1);
                    edge_normal = math.cross(z, ac);
                    if (math.dot(edge_normal, ao) > tolerance) {
                        if (math.dot(ac, ao) > tolerance) {
                            s = [s[0], s[2]];
                            d = edge_normal;
                        } else {
                            if (math.dot(ab, ao) > tolerance) {
                                s = [s[0], s[1]];
                                d = math.tripleProduct(ab, ao, ab);
                            } else {
                                s = [s[0]];
                                d = s[0];
                            }
                        }
                    } else {
                        if (math.dot(math.cross(ab, z), ao) > tolerance) {
                            if (math.dot(ab, ao) > tolerance) {
                                s = [s[0], s[1]];
                                d = math.tripleProduct(ab, ao, ab);
                            } else {
                                s = [s[0]];
                                d = s[0];
                            }
                        } else {
                            // intersection
                            has_collision = true;

                            break;
                        }
                    }
                }

            }
            return has_collision;

        },
        testGJKSeparation: function (collidable1, collidable2, position1, position2) {
            var math = this,
                relative_position = math.sub(position2, position1),
                has_collision, poly1, poly2,
                support_function, s, a, b, d, ab, ac, ao, z, edge_normal,
                closest_point, c, support, dc, da, tolerance,
                sep_vec = math.vec2(),
                getClosestPoint;

            poly1 = math.polygon(collidable1);
            poly2 = math.offset(math.polygon(collidable2), relative_position);

            // our Minkowski difference will be (poly2 - poly1)

            /**
             *  Poly-poly support function
             *  returns the vertex in the minkowski difference of the two polygons
             */
            support_function = function (poly1, poly2, direction) {
                var support_subroutine = function (poly, vector) {
                    return _.max(poly.points, function (p) { return math.dot(p, vector) });
                };

                return (math.sub(support_subroutine(poly2, direction), support_subroutine(poly1, math.mul(direction, -1))));
            };

            support = function (dir) {
                return support_function(poly1, poly2, dir);
            };

            // the direction here is arbitrary, so we choose a vector we've already created
            a = support(relative_position);
            d = math.mul(a, -1);
            b = support(d);
            s = [a, b];

            tolerance = 0.0001;


            while (true) {

                closest_point = math.pointLineDistance({
                    source: s[1],
                    dest:   s[0]
                }, math.vec2());


                if (math.magSquared(closest_point) === 0) {
                    // origin is on the minkowski sum, technically a collision
                    break;
                }

                d = math.unt(math.mul(closest_point, -1));

                c = support(d);

                dc = math.dot(c, d);
                da = math.dot(s[0], d);

                if (dc - da <= tolerance) {
                    sep_vec = closest_point;
                    break;
                }

                if (math.magSquared(s[0]) < math.magSquared(s[1])) {
                    s[1] = c;
                } else {
                    s[0] = c;
                }

            }
            return sep_vec;
        },

        /**
         *
         *  Determine penetration vector based on the termination simplex provided by
         *  the GJK intersection test.  Uses EPA
         *
         *  Expanding Polytope Algorithm (EPA):
         *      determine the winding of the simplex
         *      while (true):
         *          edge <- closest edge of the simplex to the origin
         *          point <- support(minkowski_diff, edge.normal)
         *          if point is not significantly past the origin: (i.e. the edge is the actual penetration edge)
         *              return edge normal and penetration depth
         *          add point to the simplex in the correct position to split the edge into two new edges
         *
         */
        testEPAPenetration: function (poly1, poly2, support, simplex) {

            var math = this,
                /**
                 * Returns -1 if CCW, 1 if CW
                 *
                 * Uses the right hand rule of cross products to determine
                 * which direction the next edge in the polygon faces
                 * compared to the current edge
                 *
                 * @param simplex
                 * @returns {number}
                 */
                getWinding = function (simplex) {
                    var a, b, i, j, l = simplex.length;

                    for (i = 0; i < l; i += 1) {
                        j = (i + 1) % l;

                        a = simplex[i];
                        b = simplex[j];

                        if (math.cross(a, b) > 0) {
                            return 1;
                        } else if (math.cross(a, b) < 0) {
                            return -1;
                        }
                    }
                },
                /**
                 * Determines the closest edge on a simplex to the origin.
                 * @param simplex
                 * @param winding
                 */
                closestEdge = function (simplex, winding) {
                    var a, b, i, j, normal, distance,
                        edge = {
                            distance: Infinity,
                            normal: math.vec2(),
                            index: -1
                        },
                        l = simplex.length;

                    for (i = 0; i < l; i += 1) {
                        j = (i + 1) % l;
                        a = simplex[i];
                        b = simplex[j];

                        normal = math.sub(b, a);

                        if (winding < 0) {
                            normal = math.normal(normal, true);
                        } else {
                            normal = math.normal(normal, false);
                        }

                        normal = math.unt(normal);

                        distance = Math.abs(math.dot(a, normal));
                        if (distance < edge.distance) {
                            edge.distance = distance;
                            edge.normal = math.vec2(normal);
                            edge.index = j;
                        }
                    }

                    return edge;
                },

                winding = getWinding(simplex),
                point   = math.vec2(),
                edge    = {},
                projection,
                penetration = {
                    normal: math.vec2(),
                    depth: 0
                },
                __maxits = 5000;

            while (__maxits) {
                edge  = closestEdge(simplex, winding);
                point = support(edge.normal);

                projection = math.dot(edge.normal, point);
                if ((projection - edge.distance) < math.EPSILON) {
                    penetration.normal = edge.normal;
                    penetration.depth = projection;
                    break;
                }
                simplex.splice(edge.index, 0, point);

                __maxits--;
            }

            return penetration;
        },
        testGJKIntersection: function (collidable1, collidable2, position1, position2) {
            // the whole routine
            var math = this,
                relative_position = math.sub(position2, position1),
                has_collision, poly1, poly2,
                support_function, support,
                s, a, b, d, ab, ac, ao, z, edge_normal,
                tolerance;

            poly1 = math.polygon(collidable1);
            poly2 = math.offset(math.polygon(collidable2), relative_position);

            // our Minkowski difference will be (poly2 - poly1)

            /**
             *  Poly-poly support function
             *  returns the vertex in the minkowski difference of the two polygons
             */
            support_function = function (poly1, poly2, direction) {
                var support_subroutine = function (poly, vector) {
                    return _.max(poly.points, function (p) { return math.dot(p, vector) });
                };

                return (math.sub(support_subroutine(poly2, direction), support_subroutine(poly1, math.mul(direction, -1))));
            };


            support = function (dir) {
                return support_function(poly1, poly2, dir);
            };

            // the direction here is arbitrary
            a = support(relative_position);
            d = math.mul(relative_position, -1);
            s = [a];

            tolerance = 0.000001;


            while (true) {
                a = support(d);
                if (math.dot(a, d) <= 0) {
                    // no intersection
                    return math.testGJKSeparation(collidable1, collidable2, position1, position2);
                }
                s.push(a);

                ao = math.vec3(math.mul(a, -1));
                // check simplex subroutine

                if (s.length === 2) {
                    // 2-simplex AB
                    // no need to reset the simplex here, we can
                    // just set a new direction (the triple product of
                    // the edge AB with AO) from AB to the origin
                    ab = math.vec3(math.sub(s[0], s[1]));
                    d = math.tripleProduct(ab, ao, ab);

                    if (math.magSquared(d) < tolerance) {
                        // origin lies on the segment, choose a normal
                        d = math.normal(ab, false);
                    }

                    //if (math.dot(ab,ao) <= tolerance) {
                    //    // origin is on the left side of AB
                    //    s = [s[0]];
                    //    d = s[0];
                    //}
                } else {
                    // 3-simplex ABC
                    ab = math.vec3(math.sub(s[1], s[2]));
                    ac = math.vec3(math.sub(s[0], s[2]));
                    edge_normal = math.tripleProduct(ab, ac, ac);

                    /** simplified from GJK algorithm on mollyrocket */
                    // classify origin on line AC
                    if (math.dot(edge_normal, ao) >= 0) {
                        // origin is on the right side of AC
                        // new search direction is edge_normal
                        s = [s[0], s[2]];
                        d = edge_normal;
                    } else {
                        edge_normal = math.tripleProduct(ac, ab, ab);

                        if (math.dot(edge_normal, ao) < 0) {
                            // intersection
                            return math.testEPAPenetration(poly1, poly2, support, s);
                        } else {
                            s = [s[1], s[2]];
                            d = edge_normal;
                        }
                    }

                }

            }

        }
    };
});