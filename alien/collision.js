var alien = alien || {};

alien.CollisionManager = (function () {
    'use strict';

    var CollisionManager = {
        getAABB: function (poly) {
            var minx, miny, maxx, maxy, i, point;
            for (i = 0; i < poly.length; i += 1) {
                point = poly[i];
                minx = minx || point.x;
                maxx = maxx || point.x;
                miny = miny || point.y;
                maxy = maxy || point.y;

                if (point.x < minx) { minx = point.x; }
                if (point.x > maxx) { maxx = point.x; }
                if (point.y < miny) { miny = point.y; }
                if (point.y > maxy) { maxy = point.y; }
            }

            return {
                min: {
                    x: minx,
                    y: miny
                },
                max: {
                    x: maxx,
                    y: maxy
                }
            };
        },

        getVectors: function (poly) {
            var vecs = [],
                i;
            for (i = 0; i < poly.length; i += 1) {
                vecs.push({
                    origin: poly[i],
                    dest: (i === poly.length - 1) ? poly[0] : poly[i + 1]
                });
            }
            return vecs;
        },

        castRay: function (point, poly, aabb) {
            aabb = aabb || this.getAABB(poly);
            var e = (aabb.max.x - aabb.min.x) / 100,
                vectors = this.getVectors(poly),
                ray = {
                    origin: {
                        x: aabb.min.x - e,
                        y: point.y
                    },
                    dest: point
                },
                intersecting_sides = 0,
                i,
                inter;

            for (i = 0; i < vectors.length; i += 1) {
                inter = alien.Math.int(ray.dest, vectors[i].dest, ray.origin, vectors[i].origin);
                if (inter !== 0 && inter.t >= 0 && inter.t <= 1 && inter.u >= 0 && inter.u <= 1) {
                    intersecting_sides += 1;
                }
            }
            return ((intersecting_sides & 1) === 1);
        },

        projectToAxis: function (poly, axis) {
            var projections = [],
                norm_axis = alien.Math.nml(alien.Math.sub(axis.dest, axis.origin)),
                vectors = this.getVectors(poly),
                na_mag = alien.Math.mag(norm_axis),
                i,
                d;

            for (i = 0; i < vectors.length; i += 1) {
                d = {
                    x: vectors[i].dest.x,
                    y: vectors[i].dest.y
                };
                projections.push(alien.Math.dot(d, norm_axis) / na_mag);
            }
            return {
                min: Math.min.apply(Math, projections),
                max: Math.max.apply(Math, projections)
            };
        },

        separatingAxisTest: function (poly1, poly2, vecs) {
            var v = vecs || this.getVectors(poly1),
                collision_axis,
                collision_depth = -1,
                i,
                vec,
                projection1,
                projection2,
                depth;

            for (i = 0; i < v.length; i += 1) {
                vec = v[i];
                projection1 = this.projectToAxis(poly1, vec);
                projection2 = this.projectToAxis(poly2, vec);
                depth = ((projection1.max - projection1.min) + (projection2.max - projection2.min)) -
                    (Math.max(projection1.max, projection2.max) - Math.min(projection1.min, projection2.min));
                if (depth > 0) {
                    if (collision_depth < 0 || collision_depth > depth) {
                        collision_depth = depth;
                        collision_axis = v[i];
                    }
                } else {
                    return false;
                }
            }
            return {
                axis: collision_axis,
                depth: collision_depth
            };
        },

        AABBTest: function (aabb1, aabb2) {
            if (aabb1.min.x < aabb2.max.x && aabb1.max.x > aabb2.min.x) {
                return aabb2.max.x - aabb1.min.x;
            }
            if (aabb2.min.x < aabb1.max.x && aabb2.max.x > aabb1.min.x) {
                return aabb1.max.x - aabb2.min.x;
            }
            if (aabb1.min.y < aabb2.max.y && aabb1.max.y > aabb2.min.y) {
                return aabb2.max.y - aabb1.min.y;
            }
            if (aabb2.min.y < aabb1.max.y && aabb2.max.y > aabb1.min.y) {
                return aabb1.max.y - aabb2.min.y;
            }

            return 0;
        },

        offset: function (poly, position) {
            var offset_poly = [],
                i;
            for (i = 0; i < poly.length; i += 1) {
                offset_poly.push(alien.Math.add(poly[i], position));
            }
            return offset_poly;
        },

        tests: {
            pointInAABB: function (point, aabb) {
                return !((point.x < aabb.min.x || point.x > aabb.max.x) ||
                    (point.y < aabb.min.y || point.y > aabb.max.y));
            },
            pointInPoly: function (point, poly) {
                var aabb = this.getAABB(poly);
                return (this.pointInAABB(point, aabb)) ? this.castRay(point, poly, aabb) : false;
            }
        },
        collide: function (e1, e2) {
            if (e1.hasOwnProperty('collider') && e2.hasOwnProperty('collider')) {
                var p1 = e1.position || alien.Math.Vector(),
                    p2 = e2.position || alien.Math.Vector(),
                    o1 = this.offset(e1.collider, p1),
                    o2 = this.offset(e2.collider, p2);
                if (this.AABBTest(o1, o2)) {
                    return this.separatingAxisTest(this.offset(e1.collider, p1), this.offset(e2.collider, p2));
                }
            }
            return false;
        },
        update: function (dt, scene) {
            var i,
                j,
                c;
            for (i = 0; i < scene.entities.length - 1; i += 1) {
                for (j = i + 1; j < scene.entities.length; j += 1) {
                    c = this.tests.collide(scene.entities[i], scene.entities[j]);
                    if (c) {
                        scene.entities[i].trigger('collide', c);
                        scene.entities[j].trigger('collide', c);
                    }
                }
            }
        }
    };

    return CollisionManager;

}());
