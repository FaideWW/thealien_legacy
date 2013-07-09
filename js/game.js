/**
 * The Alien
 * Written by faide
 * begun 8 July 2013
 *
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

alien.Timer = function() {
	//Timer object that handles keeping track of gametime for updates, time-dependent gamelogic, etc
	var fps = 60;
	var minfps = 30;
	var lastFrame = Date.now();
	var frameTime = 0;
	var maxFrameTime = 1000 / minfps;
	var minFrameTime = 1000 / fps;
	var time = 0;

	return {
		tick: function() {
			//Move the game time forward one step.  Returns true if this call is a tick, false otherwise
			var now = Date.now();
			var timeDelta = now - lastFrame;
			if (timeDelta < minFrameTime) { 
				//if we haven't reached the next step yet, bail out
				return false; 
			}
			if (timeDelta > maxFrameTime) {
				frameTime = maxFrameTime;
			} else {
				frameTime = timeDelta;
			}
			time += frameTime;
			lastFrame = now;
			return true;
		}
	};
}();

alien.Game = function() {

	var running = false;

	function draw() {
		document.write('draw<br>');
	};

	function update() {
		document.write('update<br>');
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
		window.requestNextFrame(draw);
	};

	return {
		begin: function() {
			running = true;
			run();
		},
		stop: function() {
			running = false;
		},
		getFPS: function() {
			return fps;
		}
	};
}();

/**
 * Search for a requestAnimationFrame hack to reduce cpu usage
 * If it doesn't exist, fallback to setInterval on the game's fps
 */

alien.Game.begin();
setTimeout(alien.Game.stop, 1000);