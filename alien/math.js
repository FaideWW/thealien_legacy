var alien = alien || {};

alien.Math = (function() {
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

            Vector.prototype.add = function(v1, v2) {
                return {
                    x: v1.x + v2.x,
                    y: v1.y + v2.y
                };
            };

            Vector.prototype.sub = function(v1, v2) {
                return {
                    x: v1.x - v2.x,
                    y: v1.y - v2.y
                };
            };

            Vector.prototype.mag = function(v1) {
                return Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2));
            };

            Vector.prototype.nml = function(v1) {
                var m = this.mag(v1);
                return {
                    x: v1.x / m,
                    y: v1.y / m
                };
            };

            Vector.prototype.dot = function(v1, v2) {
                return (v1.x * v2.x) + (v1.y * v2.y);
            };

            Vector.prototype.cmg = function(v1, v2) {
                return (v1.x * v2.y) - (v1.y * v2.x);
            };

            Vector.prototype.int = function(v1, v2, o1, o2) {
                var r = this.sub(v1, o1),
                s = this.sub(v2, o2),
                c = this.cmg(r, s);

                return (c === 0) ? 0 : {
                    t: (this.cmg(this.sub(o2, o1), s) / c),
                    u: (this.cmg(this.sub(o2, o1), r) / c)
                };
            };

            return Vector;

        }()),
        
        min: function(vals) {
            var m = null;
            for (var i = 0; i < vals.length; i += 1) {
                if (m === null || vals[i] < m) {
                    m = vals[i];
                }
            }
            return m;
        },

        max: function(vals) {
            var m = null;
            for (var i = 0; i < vals.length; i += 1) {
                if (m === null || vals[i] > m) {
                    m = vals[i];
                }
            }
            return m;
        },
    };

    return Math;

}());
