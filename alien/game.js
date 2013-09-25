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
        if (alien.hasOwnProperty('EventManager')) {
            var e;
            for (e in alien.EventManager) {
                if (alien.EventManager.hasOwnProperty(e)) {
                    this.canvas.addEventListener(e, function(ev) {
                        
                        alien.EventManager[e](ev, this.scene);
                    });
                }
            }
        }
        this.timer = 0;
        this.running = false;
    }

    Game.prototype.setScene= function(scene) {
        this.scene = scene;
        return this.scene;
    };

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