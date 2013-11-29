define(["./global"], function(Global) {
    /**
     * alien.Game
     * - canvas : HTMLElement - rendering canvas
     * - timer : Number - time elapsed since the game has begun running
     * - running : Boolean - whether or not the game is current running
     * - frametime : Number - the time to elapse between timesteps
     *
     * This is the main engine object which contains the list of scenes,
     * entities and module pointers.  The webpage initializes this object 
     * and through it begins and pauses the game loop.
     *
     * The main game loop currently loops through all systems in 
     *  alien.systems, and if they contain an update() method, calls it
     *  providing the time since the last iteration of the loop, and itself
     *
     * 
     *  
     * 
     */
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

    var Game = (function() {
        'use strict';

        Game.default_properties = {
            systems: []
        };

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
            this.frametime = 1000 / (options.fps || 60);
            this.systems = [];
            var i;
            for (i in  Game.default_properties) {
                if (Game.default_properties.hasOwnProperty(i)) {
                    this[i] = Game.default_properties[i];
                }
            }
        }

        Game.prototype.run = function() {
            if (!this.running) {
                this.running = true;
                this.step(this, new Date().getTime());
            }
        };

        Game.prototype.step = function(t, last_tick) {
            if (t.running) {
                var d = new Date().getTime(),
                    s;
                for (s in t.systems) {
                    if (t.systems[s].update) {
                        t.systems[s].update(d - last_tick, t);
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
    return Game;
});