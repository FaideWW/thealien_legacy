/**
 * The Alien
 * Written by faide
 * begun 8 July 2013
 *
 */



/**
 * Search for a requestAnimationFrame hack to reduce cpu usage
 * If it doesn't exist, fallback to setInterval on the game's fps
 */
window.requestNextFrame = function() {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / Game.getFPS);
		}
	);
}();

//alien namespace
var alien = {};


//Timer object handles keeping track of gametime for updates, time-dependent gamelogic, etc
alien.Timer = function() {
	var fps = 30;
	var lastFrame = Date.now();
	var frameTime = 0;
	var minFrameTime = 1000 / fps;
	var time = 0;

	//pause gametime properties
	var paused = false, pauseTime = 0;

	//call this only after fps has been changed
	function recalculateTimings()
	{
		minFrameTime = 1000 / fps;
	}

	return {
		tick: function() {
			if (paused) {
				alien.Timer.resume();
			}
			//Move the game time forward one step.  Returns true if this call is a tick, false otherwise
			var now = Date.now();
			var timeDelta = now - lastFrame;
			if (timeDelta < minFrameTime) { 
				//if we haven't reached the next step yet, bail out
				return false; 
			}
			// if (timeDelta > 2 * maxFrameTime) {
			// 	frameTime = maxFrameTime;
			// } else {
			// 	frameTime = timeDelta;
			// }
			frameTime = timeDelta;
			document.getElementById('frametime').innerHTML = frameTime;
			time += frameTime;
			lastFrame = now;
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
				lastFrame = Date.now();
			}

		},
		getTime: function() {
			return time;
		},
		getFPS: function() {
			return fps;
		},
		setFPS: function(new_fps) {
			fps = new_fps;
			recalculateTimings();
			// console.log('fps:' + fps);
		}
	};
}();

//Game object manages game loop and game state
alien.Game = function() {

	var running = false;
	var draws = 0, updates = 0;

	//this is called on the first Game.begin() to signal that time should begin counting 
	var initialized = false;

	function draw() {
		draws += 1;
		document.getElementById('draws').innerHTML = draws;
	};

	function update() {
		updates += 1;
		document.getElementById('updates').innerHTML = updates;
		
	};

	function run() {
		if (running) {
			step();
			setTimeout(run, 0);
		}
	};

	function step() {
		if (alien.Timer.tick()) {
			update();
		}
		document.getElementById('time').innerHTML = Math.round(alien.Timer.getTime());
		window.requestNextFrame(draw);
	};

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

