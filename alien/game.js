var alien = alien || {};


alien.Game = (function() {
    'use strict';
    function Game(options) {
        // enforces new
        if (!(this instanceof Game)) {
            return new Game(opions);
        }
        options = options || {};

        if (!options.hasOwnProperty('canvas')) {
            console.error('No canvas element defined in options.');
        }
        this.canvas = options['canvas'];
        this.timer = 0;
        this.running = false;
    }

    Game.prototype.run = function() {
        if (running) {
            step();
        }
    };

    Game.prototype.step = function() {

    };

    Game.prototype.stop = function() {

    };
    
    return Game;
}());