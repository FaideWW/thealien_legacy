var alien = alien || {};

alien.Math = (function(MATH) {
    'use strict';

    var Math = {
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

            Vector.prototype.add = function(v2) {
                return new alien.Math.Vector({
                    x: this.x + v2.x,
                    y: this.y + v2.y
                });
            };

            Vector.prototype.sub = function(v2) {
                return new alien.Math.Vector({
                    x: this.x - v2.x,
                    y: this.y - v2.y
                });
            };

            Vector.prototype.mul = function(s) {
                return new alien.Math.Vector({
                    x: this.x * s,
                    y: this.y * s
                });
            }

            Vector.prototype.mag = function() {
                return MATH.sqrt(MATH.pow(this.x, 2) + MATH.pow(this.y, 2));
            };

            Vector.prototype.unt = function() {
                var m = this.mag();
                return new alien.Math.Vector({
                    x: this.x / m,
                    y: this.y / m
                });
            };

            Vector.prototype.nml = function() {
                //rotate 90 degrees counterclockwise
                return new alien.Math.Vector({
                    x: -this.y,
                    y: this.x
                })
            }

            Vector.prototype.dot = function(v2) {
                return (this.x * v2.x) + (this.y * v2.y);
            };

            Vector.prototype.cmg = function(v2) {
                return (this.x * v2.y) - (this.y * v2.x);
            };
            
            Vector.prototype.int = function(v2, o1, o2) {
                var r = this.sub(o1),
                s = v2.sub(o2),
                c = r.cmg(s);

                return (c === 0) ? 0 : {
                    t: (this.cmg(this.sub(o2, o1), s) / c),
                    u: (this.cmg(this.sub(o2, o1), r) / c)
                };
            };

            Vector.prototype.toString = function() {
                return "{x: " + this.x + ", y: " + this.y + ", z: " + this.z + "}";
            }

            return Vector;

        }()),
        
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

    return Math;

}(Math));
