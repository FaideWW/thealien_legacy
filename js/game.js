/***
 * The Alien
 * Written by faide
 * begun 8 July 2013
 *
 */



/**
* Polyfill for requestAnimationTick
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

/**
* Polyfill for CustomEvent
*/

(function () {
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   };

  CustomEvent.prototype = window.CustomEvent.prototype;

  window.CustomEvent = CustomEvent;
})();


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


//Game object manages game loop and game state
alien.Game = function() {

	var running = false;
	//this is called on the first Game.begin() to signal that time should begin counting 
	var initialized = false;
	var lastTime;

	function draw() {
		alien.Report.draw();
	}

	function update(dt) {
		alien.Report.update(dt);
		var e = new CustomEvent("update", {
			detail: {
				timeDelta: dt
			}
		});
		alien.Render.canvas().dispatchEvent(e);
		alien.Behavior.update(dt);

	}

	function run() {
		if (running) {
			step();
			setTimeout(run, 0);
		}
	}

	function step() {
		if (alien.Timer.tick()) {
			lastTime = lastTime || 0;
			var timeSince = alien.Timer.getTime() - lastTime;
			update(timeSince);
			lastTime = alien.Timer.getTime();
		}
		alien.Report.time(alien.Timer.getTime());
		window.requestNextTick(alien.Render.update);
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

var c = alien.Render.ctx;

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


//bind component factories to the component manager
var collider = alien.Component.factories.add(ColliderFactory);
var listener = alien.Component.factories.add(ListenerFactory);
var poly = alien.Component.factories.add(PolygonFactory);
var pos = alien.Component.factories.add(PositionFactory);
var renderable = alien.Component.factories.add(RenderableFactory);

//create some properties for an entity
var square = alien.Component.instances.create({
	ctype: poly,
	shape: 'rect',
	width: 100,
	height: 100,
	color: "rgba(255,0,0,1)"
});

var click_callback = function() {
	console.log('click');
}

var l = alien.Component.instances.create({
	ctype: listener,
	events: {
		click: [click_callback]
	}
});

console.log(l);

var r1 = alien.Component.instances.create({
	ctype: renderable,
	poly: square,
	visible: false
});

var p = alien.Component.instances.create({
	ctype: pos,
	x: 100,
	y: 100
});

var c = alien.Component.instances.create({
	ctype: collider,
	poly: square
});

//create the entity and assign the components
var obj1 = alien.Entity.create();
obj1.components.add(r1);
obj1.components.add(p);
obj1.components.add(c);
obj1.components.add(l);

//initialize systems
var canvas = document.getElementById('alienCanvas');
alien.Render.init(canvas, renderable, poly, pos);
alien.Collision.init(collider, pos);
alien.Event.init(listener, collider, alien.Render.canvas());
alien.Behavior.init({
	collider: collider,
	listener: listener,
	polygon: poly,
	position: pos,
	renderable: renderable
});

//alien.Behavior.add(obj1, DragDropBehavior);
alien.Behavior.add(obj1, OscillateBehavior.create(5000,50,90));

//clone object (does not clone behaviors, those will have to be manually cloned)
obj2 = alien.Entity.clone(obj1);

alien.Behavior.add(obj2, DragDropBehavior.create());

obj2.components.get(pos).x = 100;
obj2.components.get(pos).y = 300;

obj2.components.get(renderable).poly.color = "rgba(0,0,255,1)";


alien.Event.registerListener(obj2);
alien.Event.registerListener(obj1);


//add entity to renderer
alien.Render.entities.add(obj1);
alien.Render.entities.add(obj2);

alien.Render.update();

