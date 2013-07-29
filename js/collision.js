var alien = alien || {};

//Collision detection for game objects
alien.Collision = function() {
	var init = false;
	var components = {};

	//encapsulate a polygon in an axis-aligned bounding box
	function getAABB(poly) {
		var minx, miny, maxx, maxy;
		for (var i = 0; i < poly.length; i+=1) {
			var point = poly[i];
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

	//return a list of vectors from a polygon
	function getVectors(poly, aabb) {
		var vectors = [];
		for (var i = 0; i < poly.length; i+=1) {
			var origin = poly[i], dest;
			if (i === poly.length-1) {
				dest = poly[0];
			} else {
				dest = poly[i+1];
			}

			vectors.push({
				origin: origin,
				dest: dest
			});
		}
		return vectors;
	}

	/* ---------------- vector operations (move these to a vector library) -------------------- */
	//returns the cross product of a pair of vectors (v1 x v2)
	function crossVectors(v1, v2) {
		var v = {
				x: v1.dest.x - v1.origin.x,
				y: v1.dest.y - v1.origin.y
			},
			w = {
				x: v2.dest.x - v2.origin.x,
				y: v2.dest.y - v2.origin.y
			};
		return ((v.x * w.y) - (v.y * w.x));
	}

	//test if a pair of vectors intersect and the type of intersection
	//returns 0 for no intersection, 1 for exactly one intersection, and -1 for a colinear intersection
	function intersectVectors(v1, v2, e) {
		//using vector cross products:
		var p = {
				x: v1.origin.x,
				y: v1.origin.y
			},
			q = {
				x: v2.origin.x,
				y: v2.origin.y
			},
			r = {
				x: v1.dest.x - p.x,
				y: v1.dest.y - p.y
			},
			s = {
				x: v2.dest.x - q.x,
				y: v2.dest.y - q.y
			};

			if (alien.Vector.crossmag(r, s) === 0) {
				return 0;
			}
			
		return {
			t: ((alien.Vector.crossmag(alien.Vector.sub(q, p), s)) / alien.Vector.crossmag(r, s)),
			u: ((alien.Vector.crossmag(alien.Vector.sub(q, p), r)) / alien.Vector.crossmag(r, s))
		};

	}

	//find the number of sides of a polygon a ray intersects from a point in an arbitrary direction
	//returns true if the number of intersections is odd (inside the poly), false otherwise
	function castRay(point, poly, aabb) {
		//if an aabb is available we can expedite things
		aabb = aabb || getAABB(poly);
		//epsilon accuracy tolerance: 1% of horizontal AABB size
		var e = (aabb.max.x - aabb.min.x) / 100,
		//build the vectors
		vectors = getVectors(poly),
		//build an eastbound ray from the west edge of the bounding box (minus epsilon) to the point in question
		ray = {
			origin: {
				x: aabb.min.x - e,
				y: point.y
			},
			dest: point
		},
		intersecting_sides = 0;
		for (var i = 0; i < vectors.length; i+=1) {
			var intersection =  intersectVectors(ray, vectors[i], e);
			if (intersection === 0) {
				//parallel
				continue;
			}
			if (intersection.t >= 0 && intersection.t <= 1 &&
				intersection.u >= 0 && intersection.u <= 1) {
				//intersection
				intersecting_sides += 1;
			}
		}

		if ((intersecting_sides & 1) === 1) {
			return true;
		} else {
			return false;
		}

	}

	return {
		tests: {
			pointInAABB: function(point, aabb) {
				if ((point.x < aabb.min.x || point.x > aabb.max.x) ||
					(point.y < aabb.min.y || point.y > aabb.max.y)) {
					return false;
				} else {
					return true;
				}
			},

			pointInPoly: function(point, poly) {
				//short circuit with an AABB test first
				var aabb = getAABB(poly);
				if (!this.pointInAABB(point, aabb)) {
					//the point is definitely not in the poly
					return false;
				}

				return castRay(point, poly, aabb);

			}
		},

		//tests whether or not two colliders intersect
		collide: function(entity1, entity2) {
			if (init) {
				if (entity1.components.has(components.c) && 
					entity1.components.has(components.p) &&
					entity2.components.has(components.c) &&
					entity2.components.has(components.p)) {
				}
			}
			return false;
		},
		//tests whether or not a point is inside an entity's bounding box (equivalent to tests.pointInPoly)
		pointCollide: function(point, entity) {
			if (init) {
				if (entity.components.has(components.c) && entity.components.has(components.p)) {
					var p = entity.components.get(components.p),
						vertices = entity.components.get(components.c).poly.points,
						offset = [];
					for (var vertex in vertices) {
						offset[vertex] = {
							x: vertices[vertex].x + p.x,
							y: vertices[vertex].y + p.y
						};
					}
					return this.tests.pointInPoly(point, offset);
				}
			}
			return false;
		},
		init: function(collider, position) {
			init = true;
			components = {
				c: collider,
				p: position
			};
			return init;
		}
	};
}();

var ColliderFactory = function(options) {
	options = options || {};
	options.componentname = "Collider";
	options.collidable = options.collidable || false;
	options.poly = options.poly || null;
	return options;
};