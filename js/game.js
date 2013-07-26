/***
 * The Alien
 * Written by faide
 * begun 8 July 2013
 *
 */



/***
* Search for a requestAnimationTick hack to reduce cpu usage
* If it doesn't exist, fallback to setInterval on the game's tps

*/
window.requestNextTick = function() {
	return (
		window.requestAnimationTick ||
		window.webkitRequestAnimationTick ||
		window.mozRequestAnimationTick ||
		window.oRequestAnimationTick ||
		window.msRequestAnimationTick ||
		function(callback) {
			window.setTimeout(callback, 1000 / alien.Game.getTPS);
		}
		);
}();

//alien namespace
var alien = alien || {};

/**
* Analytics and logging for game statistics (tickrate, time, call frequency, etc)
* @constructor
*/
alien.Report = function() {
	//master switch that enables or disables reporting
	var debug = true;

	var ticks = [];
	var averageTPS = 0;
	var ticksToRecord = 50;
	var currentRecordedTicks = 0;

	//dpt = draws per tick
	var updates = 0, draws = 0;
	var dpt = 0;
	var fps = 0;

	//adds a tick to the average tps calculation.
	// if the maximum amount of ticks is recorded, 
	// the oldest record is removed and replaced with the newest
	function calculateAverageTPS(tickTime) {
		ticks.push(tickTime);
		currentRecordedTicks += 1;

		//if there are too many ticks, chop the oldest off
		if (currentRecordedTicks > ticksToRecord) {
			ticks = ticks.slice(1);
			currentRecordedTicks -= 1;
		}

		//lambda reduce the array to a sum (NOT AVAILABLE IN <IE9)
		var sum = ticks.reduce(function(a, b) { return a + b; });
		averageTPS = currentRecordedTicks * 1000 / sum;
	}

	return {
		time: function(total) {
			if (debug) {
				document.getElementById('time').innerHTML = total;
			}
		},
		tick: function(lastTickTime) {
			if (debug) {
				calculateAverageTPS(lastTickTime);
				document.getElementById('ticktime').innerHTML = lastTickTime;
				document.getElementById('tps').innerHTML = averageTPS;
			}

		},
		draw: function() {
			if (debug) {
				draws += 1;
				dpt += 1;
				document.getElementById('draws').innerHTML = draws;
			}

		},
		update: function() {
			if (debug) {
				updates += 1;
				document.getElementById('updates').innerHTML = updates;
				document.getElementById('dpt').innerHTML = dpt;
				if (averageTPS !== 0 && dpt !== 0) {
					//lazy updating: only recalculates once per tick
					//always averages around 200fps
					fps = dpt * averageTPS;
					document.getElementById('fps').innerHTML = fps;
				}
				dpt = 0;
			}
		},
		log: function(message) {
			document.getElementById('eventlog').value = (message + '\n') + document.getElementById('eventlog').value;
		},
		error: function(message) {
			console.error('Error: ' + message);
		},
		warning: function(message) {
			console.warn('Warning: ' + message);
		}
	};

}();

//Timer object handles keeping track of gametime for updates, time-dependent gamelogic, etc
alien.Timer = function() {
	var tps = 30;
	var lastTick = Date.now();
	var tickTime = 0;
	var minTickTime = 1000 / tps;
	var time = 0;

	//pause gametime properties
	var paused = false, pauseTime = 0;

	//call this only after tps has been changed
	function recalculateTimings() {
		minTickTime = 1000 / tps;
	}

	return {
		tick: function() {
			if (paused) {
				alien.Timer.resume();
			}
			//Move the game time forward one step.  Returns true if this call is a tick, false otherwise
			var now = Date.now();
			var timeDelta = now - lastTick;
			if (timeDelta < minTickTime) {
				//if we haven't reached the next step yet, bail out
				return false;
			}
			//if (timeDelta > 2 * maxTickTime) {
			//	tickTime = maxTickTime;
			//} else {
			//	tickTime = timeDelta;
			//}
			tickTime = timeDelta;
			alien.Report.tick(tickTime);
			time += tickTime;
			lastTick = now;
			return true;
		},
		reset: function() {
			time = 0;
		},
		isPaused: function() {
			return paused;
		},
		pause: function() {
			if (!paused) {
				paused = true;
				pauseTime = Date.now();
			}
		},
		resume: function() {
			if (paused) {
				paused = false;
				lastTick = Date.now();
			}

		},
		getTime: function() {
			return time;
		},
		getTPS: function() {
			return tps;
		},
		setTPS: function(new_tps) {
			tps = new_tps;
			recalculateTimings();
			// console.log('tps:' + tps);
		}
	};
}();

alien.Renderer = function()
{
	var canvas = document.getElementById('alienCanvas');

	return {
		//the rendering context
		ctx: canvas.getContext('2d'),
		//the DOM object
		canvas: canvas
	};

}();

/**
*	Event handler - captures raw js/browser events and passes them to the registered
*  callbacks
*/
alien.Event = function() {

	var events = {
		'click': [],
		'dblclick': [],
		'mousedown': [],
		'mouseup': [],
		'mouseover': [],
		'mouseout': [],
		'mousemove': [],
		'keydown': [],
		'keyup': []
	};

	function generateEvent(e) {
		//augment event with some extra parameters
		e = e || {};
		e.timestamp = Date.now();
		return e;
	}

	function catchEvent(e) {
		if (alien.Game.isRunning()) {
			//console.log(e);
			//alien.Report.log('event caught: ' + e.type);
			for (var cb in events[e.type]) {
				events[e.type][cb](e);
			}
		}
	}

	//bind events to the canvas
	(function () {
		for (var eventType in events) {
			alien.Renderer.canvas.addEventListener(eventType, catchEvent);
		}
	})();

	return {
		registerEvent: function(eventType, callback, identifier) {
			if (!(eventType in events)) {
				//if the event does not exist
				alien.Report.error("Invalid event type");
				return false;
			}

			if (events[eventType][identifier] !== undefined) {
				//if this binding exists
				alien.Report.error(eventType + " event already registered with that identifier");
				return false;
			}
			//bind it
			events[eventType][identifier] = callback;
			return true;
		},

		unregisterEvent: function(eventType, identifier) {
			if (!(eventType in events)) {
				//if the event does not exist
				alien.Report.error("Invalid event type");
				return false;
			}

			if (events[eventType].indexOf(identifier) === -1) {
				//if the binding does not exist (just warn, not a fatal error)
				alien.Report.warning("Event with that identifier does not exist");
				return true;
			}

			delete events[eventType][identifier];
			return true;
		}
	};
}();

//Collision detection for game objects
alien.Collision = function() {
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
	};
}();

//Game object manages game loop and game state
alien.Game = function() {

	var running = false;
	//this is called on the first Game.begin() to signal that time should begin counting 
	var initialized = false;

	function draw() {
		alien.Report.draw();
	}

	function update() {
		alien.Report.update();
	}

	function run() {
		if (running) {
			step();
			setTimeout(run, 0);
		}
	}

	function step() {
		if (alien.Timer.tick()) {
			update();
		}
		alien.Report.time(alien.Timer.getTime());
		window.requestNextTick(draw);
	}

	return {
		begin: function() {
			if (!initialized) {
				alien.Timer.reset();
				initialized = true;
			}

			if (alien.Timer.isPaused())
			{
				alien.Timer.resume();
			}

			running = true;
			run();
		},
		stop: function() {
			alien.Timer.pause();
			running = false;
		},
		isRunning: function() {
			return running;
		}
	};
}();

var c = alien.Renderer.ctx;

var octagon = [
	{
		x: 100,
		y: 100
	},
	{
		x: 125,
		y: 125
	},
	{
		x: 125,
		y: 150
	},
	{
		x: 100,
		y: 175
	},
	{
		x: 75,
		y: 175
	},
	{
		x: 50,
		y: 150
	},
	{
		x: 50,
		y: 125
	},
	{
		x: 75,
		y: 100
	}
];

var color = "rgba(200,0,0,0.5)";

c.fillStyle = color;
c.beginPath();
c.moveTo(octagon[0].x, octagon[0].y);
for (var i = 1; i < octagon.length; i+=1) {
	c.lineTo(octagon[i].x, octagon[i].y);
}
c.closePath();
c.fill();

var clickIntersectionTest = function(e) {
	var point = {
		x: e.layerX,
		y: e.layerY
	};

	var intersection = alien.Collision.pointInPoly(point, octagon);

	alien.Report.log('clicked on shape: ' + intersection);
}

alien.Event.registerEvent('click', clickIntersectionTest, 'clickIntersection');