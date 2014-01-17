define(function() {

    var AlienMath = (function(MATH) {
        'use strict';

        var AlienMath = {
            /**
             * AlienMath.Vector
             *
             * Represents a point in 3-space. 
             * Can also represent a directed vector from the 
             *  coordinate origin (0,0,0) and the designated point.
             *
             * More often than not, the z-value is 0 because we're
             *  representing a 2-dimensional space.  So z is mostly
             *  used for rendering order.  
             *  
             *  z has no effect on collision detection.
             * 
             * The Vector prototype contains all of the 
             * transformations/operations that can be performed on it.
             */
            Vector: (function() {
                'use strict';

                function Vector(args) {
                    // enforces new
                    if (!(this instanceof Vector)) {
                        return new Vector(args);
                    }
                    args = args || [];
                    this.x = args.x || 0;
                    this.y = args.y || 0;
                    this.z = args.z || 0;
                }

                Vector.prototype.clone = function() {
                    return new Vector(this);
                }
                //addition with another vector
                Vector.prototype.add = function(v2) {
                    return new AlienMath.Vector({
                        x: this.x + v2.x,
                        y: this.y + v2.y
                    });
                };
                //subtraction of another vector (this - v2)
                Vector.prototype.sub = function(v2) {
                    return new AlienMath.Vector({
                        x: this.x - v2.x,
                        y: this.y - v2.y
                    });
                };
                //multiplication by a scalar value
                // (division is not provided, just invert the scalar value)
                Vector.prototype.mul = function(s) {
                    return new AlienMath.Vector({
                        x: this.x * s,
                        y: this.y * s
                    });
                }
                //magnitude of the vector
                Vector.prototype.mag = function() {
                    return MATH.sqrt(this.magsquared());
                };

                Vector.prototype.magsquared = function() {
                    return MATH.pow(this.x, 2) + MATH.pow(this.y, 2);
                }

                //returns a vector of the same direction with magnitude 1
                Vector.prototype.unt = function() {
                    var m = this.mag();
                    return new AlienMath.Vector({
                        x: this.x / m,
                        y: this.y / m
                    });
                };

                //returns a vector normal to the original
                // (rotated 90 degrees counter-clockwise)
                Vector.prototype.nml = function() {
                    //rotate 90 degrees counterclockwise
                    return new AlienMath.Vector({
                        x: -this.y,
                        y: this.x
                    })
                }

                //dot product 
                Vector.prototype.dot = function(v2) {
                    return (this.x * v2.x) + (this.y * v2.y);
                };

                //magnitude of the cross product 
                // (the 2D derivation which is much faster than its 
                //  3D equivalent)
                Vector.prototype.cmg = function(v2) {
                    return (this.x * v2.y) - (this.y * v2.x);
                };
                
                //intersection of two vectors (offset by o1, o2)
                // if there is no intersection, returns 0
                // otherwise, returns {t, u} where t is the magnitude
                // of the vector needed to travel from its origin
                // to the intersection point, and likewise for u and v2,o2
                Vector.prototype.int = function(v2, o1, o2) {
                    var r = this.sub(o1),
                    s = v2.sub(o2),
                    c = r.cmg(s);

                    return (c === 0) ? 0 : {
                        t: (this.cmg(this.sub(o2, o1), s) / c),
                        u: (this.cmg(this.sub(o2, o1), r) / c)
                    };
                };

                Vector.prototype.scalarProject = function(axis) {
                    return this.dot(axis.unt());
                }

                //pretty print the value of the vector
                Vector.prototype.toString = function() {
                    return "{x: " + this.x + ", y: " + this.y + ", z: " + this.z + "}";
                }

                return Vector;

            }()),
            
            /**
             * AlienMath.min
             * similar to Math.min, except this can also accept
             *  a list of objects and the key of the value to compare
             *
             *  for example, to find the AlienMath.Vector furthest to the left:
             *   AlienMath.min(vectors, 'x')
             */
            min: function(vals, key) {
                key = key || null;
                var m = null;
                for (var i = 0; i < vals.length; i += 1) {
                    if (key === null) {
                        if (m === null || vals[i] < m) {
                            m = vals[i];
                        }
                    } else {
                        if (m === null || vals[i][key] < m) {
                            m = vals[i][key];
                        }
                    }
                }
                return m;
            },

            /**
             * AlienMath.max
             * identical to AlienMath.min, but for finding maximum values
             *  instead of minimums
             */
            max: function(vals, key) {
                key = key || null;
                var m = null;
                for (var i = 0; i < vals.length; i += 1) {
                    if (key === null) {
                        if (m === null || vals[i] > m) {
                            m = vals[i];
                        }
                    } else {
                        if (m === null || vals[i][key] > m) {
                            m = vals[i][key];
                        }
                    }
                }
                return m;
            },
        };

        return AlienMath;

    }(Math));

    return AlienMath;
    
});
