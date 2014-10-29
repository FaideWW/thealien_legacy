/**
 * Created by faide on 14-10-05.
 */
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
                }
                if (points.length) {
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
        }


    };
});