var alien = alien || {};

alien.Collision = function() {
    function getAABB(poly) {
        var minx, miny, maxx, maxy;
        for (var k = 0; k < poly.length; k+=1) {
            var point = poly[k];
            minx = minx || point.x;
            maxx = maxx || point.x;
            miny = miny || point.y;
            maxy = maxy || point.y;

            if (point.x < minx) minx = point.x;
            if (point.x > maxx) maxx = point.x;
            if (point.y < miny) miny = point.y;
            if (point.y > maxy) maxy = point.y;
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
    }

    function getVectors(poly) {
        var vecs = [];
        for (var k = 0; k < poly.length; k++) {
            vecs.push({
                origin: poly[k],
                dest: (k === poly.length - 1) ? poly[0] : poly[k+1]
            });
        }
        return vecs;
    }

    function castRay(point, poly, aabb) {
        aabb = aabb || getAABB(poly);
        var e = (aabb.max.x - aabb.min.x) / 100,
            vectors = getVectors(poly),
            ray = {
                origin: {
                    x: aabb.min.x - e,
                    y: point.y
                },
                dest: point
            },
            intersecting_sides = 0;

        for (var k = 0; k < vectors.length; k++) {
            var inter = alien.Math.int(ray.dest, vectors[k].dest, ray.origin, vectors[k].origin);
            if (inter === 0) {
                continue;
            }
            if (inter.t >= 0 && inter.t <= 1 &&
                inter.u >= 0 && inter.u <= 1) {
                intersecting_sides++;
            }
        }
        return ((intersecting_sides & 1) === 1);
    }

    function projectToAxis(poly, axis) {
        var projections = [],
            norm_axis = alien.Math.nml(alien.Math.sub(axis.dest, axis.origin)),
            vectors = getVectors(poly),
            na_mag = alien.Math.mag(norm_axis);

        for (var k = 0; k < vectors.length; k++) {
            var d = {
                x: vectors[k].dest.x,
                y: vectors[k].dest.y
            };
            projections.push(alien.Math.dot(d, norm_axis) / na_mag);
        }
        return {
            min: Math.min.apply(Math, projections),
            max: Math.max.apply(Math, projections)
        };
    }

    function separatingAxisTest(poly1, poly2, vecs) {
        var v = vecs || getVectors(poly1),
            collision_axis,
            collision_depth = -1;

        for (var k = 0; k < v.length; k++) {
            var vec = v[k],
                projection1 = projectToAxis(poly1, vec),
                projection2 = projectToAxis(poly2, vec),
                depth = ((projection1.max - projection1.min) + (projection2.max - projection2.min)) -
                    (Math.max(projection1.max, projection2.max) - Math.min(projection1.min, projection2.min));
            if (depth > 0) {
                if (collision_depth < 0 ||
                    collision_depth > depth) {
                    collision_depth = depth;
                    collision_axis = v[k];
                }
            } else {
                return false;
            }
        }
        return {
            axis: collision_axis,
            depth: collision_depth
        };
    }

    function AABBTest(aabb1, aabb2) {
        if (aabb1.min.x < aabb2.max.x && aabb1.max.x > aabb2.min.x) {
            return aabb2.max.x - aabb1.min.x;
        } else if (aabb2.min.x < aabb1.max.x && aabb2.max.x > aabb1.min.x) {
            return aabb1.max.x - aabb2.min.x;
        } else if (aabb1.min.y < aabb2.max.y && aabb1.max.y > aabb2.min.y) {
            return aabb2.max.y - aabb1.min.y;
        } else if (aabb2.min.y < aabb1.max.y && aabb2.max.y > aabb1.min.y) {
            return aabb1.max.y - aabb2.min.y;
        } else {
            return 0;
        }
    }

    function offset(poly, position) {
        var offset_poly = [];
        for (var k = 0; k < poly.length; k++) {
            offset_poly.push(alien.Math.add(poly[k], position));
        }
        return offset_poly;
    }

    return {
        tests: {
            pointInAABB: function(point, aabb) {
                return !((point.x < aabb.min.x || point.x > aabb.max.x) ||
                    (point.y < aabb.min.y || point.y > aabb.max.y));
            },
            pointInPoly: function(point, poly) {
                var aabb = getAABB(poly);
                if (!this.pointInAABB(point, aabb)) {
                    return false;
                }
                return castRay(point, poly, aabb);
            }
        },
        collide: function(e1, e2)  {
            if (e1.hasOwnProperty('collider') && e2.hasOwnProperty('collider')) {
                var p1 = e1['position'] || alien.Math.Vector(),
                    p2 = e2['position'] || alien.Math.Vector(),
                    o1 = offset(e1['collider'], p1),
                    o2 = offset(e2['collider'], p2);
                if (AABBTest(o1, o2))  {
                    return separatingAxisTest(offset(e1['collider'], p1), offset(e2['collider'], p2));
                }
            }
            return false;
        },
        update: function(dt, scene) {
            for (var j = 0; j < scene.entities.length - 1; j++) {
                for (var k = j + 1; k < scene.entities.length; k++) {
                    var c = collide(scene.entities[j], scene.entities[k]);
                    if (c) {
                        scene.entities[j].trigger('collide', c);
                        scene.entities[k].trigger('collide', c);
                    }
                }
            }
        }
    }
}();