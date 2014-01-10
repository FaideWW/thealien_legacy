define(function() {
	/**
	 * alien.components.Controller
	 * - control_entity : alien.Entity - the Entity which is passed to each
	 * 									 function when a key is pressed
	 * - keymap : Object 			   - a mapping of keycodes to callbacks
	 * 									 for a key when it is pressed, and when 
	 * 									 it is released.  See below for format
	 *
	 * 
	 * The interface between the key events and game logic.
	 *
	 * Attach this component to the player character's entity,
	 * and give it a key mapping in the following format:
	 *
	 * {
	 * 	keycode : {
	 * 		down: function() { // perform keydown logic ,
	 * 		up:   function() { // perform keyup logic }
	 * 	}
	 * }
	 */

	var Controller = (function() {
		'use strict';

		var key_codes = {
			'backspace': 8,
			'tab': 9,
			'enter': 13,
			'shift': 16,
			'ctrl': 17,
			'alt': 18,
			'pausebreak': 19,
			'capslock': 20,
			'esc': 27,
			'pageup': 33,
			'pagedown': 34,
			'end': 35,
			'home': 36,
			'left': 37,
			'up': 38,
			'right': 39,
			'down': 40,
			'insert': 45,
			'delete': 46,
			'0': 48,
			'1': 49,
			'2': 50,
			'3': 51,
			'4': 52,
			'5': 53,
			'6': 54,
			'7': 55,
			'8': 56,
			'9': 57,
			'a': 65,
			'b': 66,
			'c': 67,
			'd': 68,
			'e': 69,
			'f': 70,
			'g': 71,
			'h': 72,
			'i': 73,
			'j': 74,
			'k': 75,
			'l': 76,
			'm': 77,
			'n': 78,
			'o': 79,
			'p': 80,
			'q': 81,
			'r': 82,
			's': 83,
			't': 84,
			'u': 85,
			'v': 86,
			'w': 87,
			'x': 88,
			'y': 89,
			'z': 90,
			'leftwin': 91,
			'rightwin': 92,
			'select': 93,
			'num0': 96,
			'num1': 97,
			'num2': 98,
			'num3': 99,
			'num4': 100,
			'num5': 101,
			'num6': 102,
			'num7': 103,
			'num8': 104,
			'num9': 105,
			'num*': 106,
			'num+': 107,
			'num-': 109,
			'num.': 110,
			'num/': 111,
			'f1': 112,
			'f2': 113,
			'f3': 114,
			'f4': 115,
			'f5': 116,
			'f6': 117,
			'f7': 118,
			'f8': 119,
			'f9': 120,
			'f10': 121,
			'f11': 122,
			'f12': 123,
			'numlock': 144,
			'scrolllock': 145,
			';': 186,
			'=': 187,
			',': 188,
			'-': 189,
			'.': 190,
			'/': 191,
			'`': 192,
			'[': 219,
			'\\': 220,
			']': 221,
			'\'': 222
		};

		function expandKeymap(m) {
			var fullmap = {};
			for (var k in m) {
				var keys = k.split(",");
				for (var i = 0; i < keys.length; i++) {
					fullmap[keys[i].trim()] = m[k];
				}
			}
			return fullmap;
		}

		function Controller(args) {
	        // enforces new
	        if (!(this instanceof Controller)) {
	        	return new Controller(args);
	        }
	        args = args || {};
	        if (!args.hasOwnProperty('control_entity')) {
	        	console.error("Controller requires a controllable entity");
	        	return 0;
	        }
	        this.e = args.control_entity;
	        this.keymap = expandKeymap(args.keymap || {});
	        for (var m in this.keymap) {
	        	this.keymap[m].pressed = false;
	        }
	        this.init();
	    }

	    Controller.prototype.init = function() {
	    	var m = this.keymap;
	    	this.e.on('keydown' , function(e, data) {
	    		for (var key in m) {
	    			if (data.event.keyCode === key_codes[key] && !m[key].pressed) {
	    				m[key].down(e, data);
	    				m[key].pressed = true;
	    			}
	    		}
	    	}).on('keyup' , function(e, data) {
	    		for (var key in m) {
	    			if (data.event.keyCode === key_codes[key] && m[key].pressed) {
	    				m[key].up(e, data);
	    				m[key].pressed = false;
	    			}
	    		}
	    	});
	    }

	    return Controller;

	}());
	
	return Controller;

})