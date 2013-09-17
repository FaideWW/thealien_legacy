var alien = alien || {};

alien.Math = function() {
    return {
        Vector: function(xyz) {
            xyz = xyz || {};
            return {
                x: xyz.x || 0,
                y: xyz.y || 0,
                z: xyz.z || 0
            };
        },
        add: function(v1, v2) {
            return {
                x: v1.x + v2.x,
                y: v1.y + v2.y
            };
        },
        sub: function(v1, v2) {
            return {
                x: v1.x - v2.x,
                y: v1.y - v2.y
            };
        },
        mag: function(v1) {
            return Math.sqrt(Math.pow(v1.x, 2) + Math.pow(v1.y, 2));
        },
        nml: function(v1) {
            var m = this.mag(v1);
            return {
                x: v1.x / m,
                y: v1.y / m
            };
        },
        dot: function(v1, v2) {
            return (v1.x * v2.x) + (v1.y * v2.y);
        },
        cmg: function(v1, v2) {
            return (v1.x * v2.y) - (v1.y * v2.x);
        },
        int: function(v1, v2, o1, o2) {
            var r = this.sub(v1, o1),
                s = this.sub(v2, o2),
                c = this.cmg(r, s);

            return (c === 0) ? 0 : {
                t: (this.cmg(this.sub(o2, o1), s) / c),
                u: (this.cmg(this.sub(o2, o1), r) / c)
            };
        }
    };
}();