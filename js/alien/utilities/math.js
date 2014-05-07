/**
 * Created by faide on 2014-03-11.
 */
define(["underscore"], function (_) {
    'use strict';
    var AlienMath = (function (m) {
        var Math = {
            Matrix: (function () {
                function Matrix(m) {
                    return m || [
                        [1, 0, 0],
                        [0, 1, 0],
                        [0, 0, 1]
                    ];
                }

                /* Returns the dot product of two matrices for the resulting matrix's element at <x,y> */
                function dot(m1, m2, x, y) {
                    return (m1[y][x] * m2[x][y]) +
                           (m1[y + 1][x + 1] * m2[x + 1][y + 1]) +
                           (m1[y + 2][x + 2] * m2[x + 2][y + 2]);
                }

                Matrix.prototype = {
                    mul: function (mtx) {
                        return new Matrix([
                            [dot(this, mtx, 0, 0), dot(this, mtx, 1, 0), dot(this, mtx, 2, 0)],
                            [dot(this, mtx, 0, 1), dot(this, mtx, 1, 1), dot(this, mtx, 2, 1)],
                            [dot(this, mtx, 0, 2), dot(this, mtx, 1, 2), dot(this, mtx, 2, 2)]
                        ]);
                    },
                    translate: function (vector_x, vector_y) {
                        if (vector_x instanceof Math.Vector) {
                            vector_y = vector_x.y;
                            vector_x = vector_x.x;
                        }

                        this[0][2] += vector_x;
                        this[1][2] += vector_y;

                        return this;
                    },
                    scale: function (scale_x, scale_y) {
                        if (scale_x instanceof Math.Vector) {
                            scale_y = scale_x.y;
                            scale_x = scale_x.x;
                        }
                        this[0][0] *= scale_x;
                        this[1][1] *= scale_y;

                        return this;
                    },
                    rotate: function (radians) {
                        this[0][0] *=  m.cos(radians);
                        this[0][1] *=  m.sin(radians);
                        this[1][0] *= -m.sin(radians);
                        this[1][1] *=  m.cos(radians);

                        return this;
                    }
                };
                return Matrix;
            }()),
            Vector: (function () {
                function Vector(options) {
                    if (!(this instanceof Vector)) {
                        return new Vector(options);
                    }

                    options = options || {};
                    this.x = options.x || 0;
                    this.y = options.y || 0;
                    this.z = options.z || 0;
                }

                Vector.prototype.eq = function (other) {
                    return this  === other || (this.x === other.x && this.y === other.y && this.z === other.z);
                };

                Vector.prototype.sameDir = function (other) {
                    /* fault tolerance */
                    return (this.x / this.y) - (other.x / other.y) < 0.0001;
                };

                Vector.prototype.neg = function () {
                    /* returns the opposite vector (vec + opposite = 0) */
                    return new Vector().sub(this);
                };

                Vector.prototype.add = function (other) {
                    return new Vector({
                        x: this.x + other.x,
                        y: this.y + other.y,
                        z: this.z + other.z
                    });
                };

                Vector.prototype.sub = function (other) {
                    return new Vector({
                        x: this.x - other.x,
                        y: this.y - other.y,
                        z: this.z - other.z
                    });
                };

                Vector.prototype.mul = function (scalar) {
                    return new Vector({
                        x: this.x * scalar,
                        y: this.y * scalar,
                        z: this.z * scalar
                    });
                };

                Vector.prototype.div = function (scalar) {
                    return this.mul(1 / scalar);
                };

                Vector.prototype.mag = function () {
                    return m.sqrt(this.magsqrd());
                };

                Vector.prototype.magsqrd = function () {
                    return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
                };

                Vector.prototype.unt = function () {
                    return this.div(this.mag());
                };

                Vector.prototype.nml = function (anticlockwise) {
                    anticlockwise = (anticlockwise === undefined) ? true : anticlockwise;
                    return new Vector({
                        x: anticlockwise ? -this.y : this.y,
                        y: anticlockwise ? this.x : -this.x,
                        z: this.z
                    });
                };

                Vector.prototype.dot = function (other) {
                    return (this.x * other.x) + (this.y * other.y);
                };

                //Magnitude of the cross product
                Vector.prototype.cmg = function (other) {
                    return (this.x * other.y) - (this.y * other.x);
                };

                /**
                 * Intersection of two vectors
                 *
                 * @param other
                 * @param this_origin
                 * @param other_origin
                 * @returns {*}
                 */
                Vector.prototype.int = function (other, this_origin, other_origin) {
                    this_origin = this_origin || new Vector();
                    other_origin = other_origin || new Vector();
                    var r = this.sub(this_origin),
                        s = other.sub(other_origin),
                        denom = r.cmg(s),
                        numer = other_origin.sub(this_origin).cmg(r);

                    if (denom !== 0) {
                        //intersection possible
                        return {
                            t: numer / denom,
                            u: other_origin.sub(this_origin).cmg(s) / denom
                        };
                    }
                    if (numer === 0) {
                        //colinear, search for an overlap
                        if ((this.x >= other_origin.x && this.y >= other_origin.y && this.x <= other.x && this.y <= other)) {
                            return {
                                t: 0,
                                u: 0
                            };
                        }
                        if ((other.x >= this_origin.x && other.y >= this_origin.y && other.x <= this.x && other.y <= this.y)) {
                            return {
                                t: 0,
                                u: 0
                            };
                        }
                        return false;
                    }
                    //parallel
                    return false;
                };

                Vector.prototype.scalarProject = function (axis) {
                    return this.dot(axis.unt());
                };

                Vector.prototype.vectorProject = function (axis) {
                    return axis.unt().mul(this.scalarProject(axis));
                };

                Vector.prototype.normalReflect = function (normal) {
                    normal = (normal.magsqrd() === 1) ? normal : normal.unt();
                    return normal.mul(2 * this.dot(normal)).sub(this);
                };

                Vector.prototype.toString = function () {
                    return "{" + this.x + ", " + this.y + ", " + this.z + "}";
                };

                return Vector;

            }()),

            /**
             * Creates a line segment
             * If passed a Vector or a duck-typed Vector, returns a line segment from the origin to the point defined by the Vector
             */
            Line: (function () {
                function Line(options) {
                    if (!(this instanceof Line)) {
                        return new Line(options);
                    }
                    options = options || {};

                    //ensure this.start and this.end are Vectors
                    this.start = (options.start) ? (options.start instanceof Math.Vector) ? options.start : new Math.Vector(options.start) : new Math.Vector();
                    this.end = (options.end) ? (options.end instanceof Math.Vector) ? options.end : new Math.Vector(options.end) : (options instanceof Math.Vector) ? options : new Math.Vector(options);

                    //back-references are common
                    this.poly = options.poly || null;
                }

                Line.prototype = {
                    /**
                     * Tests the intersection of this line with another
                     *
                     *
                     *
                     * @param other
                     * @returns {*}
                     *          t : Number - The point of intersection of this line
                     *          u : Number - The point of intersection of the other line
                     */
                    int: function (other) {
                        var r = this.end.sub(this.start),
                            s = other.end.sub(other.start),
                            denom = r.cmg(s),
                            numer = other.start.sub(this.start).cmg(r);

                        if (denom !== 0) {
                            //intersection possible
                            return {
                                t: numer / denom,
                                u: other.end.sub(this.start).cmg(s) / denom
                            };
                        }
                        if (numer === 0) {
                            //colinear, search for an overlap
                            if ((this.end.x >= other.start.x && this.end.y >= other.start.y && this.end.x <= other.end.x && this.end.y <= other.end.y)) {
                                return {
                                    t: 0,
                                    u: 0
                                };
                            }
                            if ((other.end.x >= this.start.x && other.end.y >= this.start.y && other.end.x <= this.end.x && other.end.y <= this.end.y)) {
                                return {
                                    t: 0,
                                    u: 0
                                };
                            }
                            return false;
                        }
                        //parallel
                        return false;
                    },
                    classify: function (point) {
                        return this.end.sub(this.start).cmg(point.sub(this.start));
                    }
                };

                return Line;
            }()),

            Polygon: (function () {
                function Polygon(options) {
                    if (!(this instanceof Polygon)) {
                        return new Polygon(options);
                    }

                    options = options || {};
                    this.points = (options.length) ? options : options.points || [];
                    this.points = _.map(this.points, function (p) { return (p instanceof this.Vector) ? p : new this.Vector(p); }, Math);
                }

                Polygon.prototype = {
                    toLines: function () {
                        var i, j, l = this.points.length, lines = [];
                        for (i = 0; i < l; i += 1) {
                            j = i + 1;
                            if (j >= l) {
                                j = 0;
                            }
                            lines.push(new Math.Line({
                                start: this.points[i],
                                end: this.points[j],
                                poly: this
                            }));
                        }
                        return lines;
                    },
                    getNormals: function () {
                        return _.map(this.toLines(), function (x) {
                            return x.end.sub(x.start).nml();
                        });
                    },
                    getPoints: function (offset) {
                        if (!offset) {
                            return this.points;
                        }
                        return _.map(this.points, function (p) {
                            return p.add(offset);
                        });
                    },
                    rotate: function (radians) {
                        var cos = m.cos(radians),
                            sin = m.sin(radians);
                        return new Polygon({
                            points: _.map(this.points, function (p) {
                                return new this.Vector({
                                    x: p.x * cos - p.y * sin,
                                    y: p.x * sin + p.y * cos
                                });
                            }, Math)
                        });
                    },
                    scale: function (scalar) {
                        return new Polygon({
                            points: _.map(this.points, function (p) {
                                return p.mul(scalar);
                            })
                        });
                    }
                };

                Polygon.factory = {
                    /**
                     * Creates a regular polygon
                     * @param sides        : Number  - number of sides of the polygon
                     * @param size         : Number  - EITHER: the radius of the circle of inscription, or
                     *                                         the length of each side.  (the latter is expensive)
                     * @param isSideLength : Boolean - Which of the two alternatives `size` refers to (defaults to false)
                     *
                     *
                     * x[n] = r * cos(2*pi*n/N)
                     y[n] = r * sin(2*pi*n/N)
                     */
                    create: function (sides, size, isSideLength) {
                        var points = [],
                            i,
                            radius = isSideLength ? (size / m.sqrt(2 - (2 * m.cos(2 * m.PI / sides)))) : size;
                        for (i = 0; i < sides; i += 1) {
                            points.push(new Math.Vector({
                                x: radius * m.cos(2 * m.PI * (i / sides)),
                                y: radius * m.sin(2 * m.PI * (i / sides))
                            }));
                        }
                        return new Polygon({
                            points: points
                        });
                    }
                };

                return Polygon;
            }()),

            withinRange: function (val, min, max, inclusive) {
                inclusive = (inclusive === undefined) ? true : inclusive;
                if (inclusive) {
                    return (min <= val && val <= max);
                }
                return (min < val && val < max);

            },

            rangeOverlaps: function (min1, max1, min2, max2) {
                return min1 < max2 && min2 < max1;
            },

            clamp: function (val, min, max) {
                return m.max(min, m.min(val, max));
            }
        };

        return Math;
    }(Math));

    return AlienMath;
});