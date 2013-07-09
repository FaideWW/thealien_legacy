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
			if (timeDelta > 2 * maxFrameTime) {
				frameTime = maxFrameTime;
			} else {
				frameTime = timeDelta;
			}
			time += frameTime;
			lastFrame = now;
			return true;
		},
		getTime: function() {
			return time;
		}
	};
}();

//Game object manages game loop and game state
alien.Game = function() {

	var running = false;
	var draws = 0, updates = 0;

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

/* automatic game loop example */
// alien.Game.begin();
// setTimeout(alien.Game.stop, 1000);


/* manual game loop example */
document.getElementById('run').onmousedown = function() {
	alien.Game.begin();
};

document.getElementById('run').onmouseup = function() {
	alien.Game.stop();
};