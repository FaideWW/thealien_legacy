/**
 * Created by faide on 14-10-05.
 */
define([], function () {
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

            if (x === undefined && y === undefined) {
                return {
                    x: 0,
                    y: 0
                };
            }

            throw new Error('Invalid parameters');
        },

        isVec2: function (v) {
            return (!(isNaN(v.x) || isNaN(v.y)));
        },

        vec3: function (x, y, z) {
            if (typeof x === 'object' && !(isNaN(x.x) || isNaN(x.y) || isNaN(x.z))) {
                return x;
            }

            if (!(isNaN(x) || isNaN(y) || isNaN(z))) {
                return {
                    x: x,
                    y: y,
                    z: z
                }
            }

            if (x === undefined && y === undefined && z === undefined) {
                return {
                    x: 0,
                    y: 0,
                    z: 0
                };
            }

            throw new Error('Invalid parameters');
        },

        isVec3: function (v) {
            return (!(isNaN(v.x) || isNaN(v.y) || isNaN(v.z)));
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
        }


    };
});