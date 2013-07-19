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
var alien = {};

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
		ctx: canvas.getContext('2d'),
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
		console.log(e);
		alien.Report.log('event caught: ' + e);
		for (var cb in events[e.type]) {
			events[e.type][cb](e);
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

var result = alien.Event.registerEvent('mousedown', function(e) {
	console.log('mousedown: ' + e.pageX + ' ' + e.pageY);
});

console.log('bind to mousedown: ' + result);

console.log(alien.Renderer.ctx);

alien.Renderer.ctx.fillStyle = "rgb(200,0,0)";
alien.Renderer.ctx.fillRect(10,10,55,50);

alien.Renderer.ctx.fillStyle = "rgba(0,0,200, 0.5)";
alien.Renderer.ctx.fillRect(30,30,55,50);
