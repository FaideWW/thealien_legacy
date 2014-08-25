define(['core/input', 'core/messenger'], function (InputManager, Messenger) {

    var nextFrame = window.requestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    function (cb) {
                        return window.setTimeout(cb, 1000 / 60);
                    };

    function Game(options) {
        if (!(this instanceof Game)) {
            return new Game(options);
        }

        options = options || {};
        if (options.canvas && typeof options.canvas === "string") {
            this.ctx = document.getElementById(options.canvas).getContext('2d');
        } else {
            this.ctx = options.canvas.getContext('2d');
        }


        //private
        this.__currentComponentBit = 1;

        //protected
        this._componentFlags = {};
        this._loopphases = [];

        //public
        this.scenes  = [];
        this.systems = {};

        InputManager.init(this.ctx.canvas);

        this.__running = false;


        // load from options
        if (options.loopphases && options.loopphases.length) {
            this._loopphases = options.loopphases;
        }
    }


    Game.prototype = {
        registerComponent: function (componentName) {
            if (this._componentFlags.hasOwnProperty(componentName)) {
                console.error('Attempt to register component of same name', componentName);
                return this._componentFlags[componentName];
            }
            if (this.__currentComponentBit === 1 << 31) {
                console.error('Maximum components registered');
                return 0;
            }
            this._componentFlags[componentName] = this.currentComponentBit;
            this.currentComponentBit = this.currentComponentBit << 1;
            return this._componentFlags[componentName];
        },

        addSystem: function(system, loopphase) {
            if (!this.systems.hasOwnProperty(loopphase)) {
                this.systems[loopphase] = [];
            }
            this.systems[loopphase].push(system);
        },

        addLoopphase: function (index, name) {
            this._loopphases.splice(index, 0, name);
            return this._loopphases;
        },

        addScene: function (scene) {
            if (!scene.msg) {
                scene.msg = Messenger;
            }
            this.scenes.push(scene);
        },

        run: function () {
            if (!this.__running) {
                this.__running = true;
                this.step(0);
            }
        },

        stop: function () {
            if (this.__running) {
                this.__running = false;
            }
        },

        step: function(time) {
            var currTime, g, dt;

            currTime = new Date().getTime();
            g = this;

            if (time !== 0) {
                dt = currTime - time;

                InputManager.processInput();
            }
            console.log('step');

            if (this.__running) {
                nextFrame(this.step.bind(g, currTime));
            }
        }
    };

    return Game;
});
