var alien = alien || {};

window.requestNextTick = function() {
    return (
        window.requestAnimationTick ||
        window.webkitRequestAnimationTick ||
        window.mozRequestAnimationTick ||
        window.oRequestAnimationTick ||
        window.msRequestAnimationTick ||
        function(callback) {
            window.setTimeout(callback, 20);
        }
    );
}();

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
        if (!this.running) {
            this.running = true;
            this.step(this, new Date().getTime());
        }
    };

    Game.prototype.step = function(t, last_tick) {
        if (t.running) {
            //debugger;
            var d = new Date().getTime(),
                s;
            for (s in alien.systems) {
                if (alien.systems[s].update) {
                    alien.systems[s].update(d - last_tick, t);
                }
            }
            t.timeoutID = window.setTimeout(t.step, 0, t, d);
        }
    };

    Game.prototype.stop = function() {
        if (this.running) {
            this.running = false;
            window.clearTimeout(this.timeoutID);
        }
    };
    
    return Game;
}());