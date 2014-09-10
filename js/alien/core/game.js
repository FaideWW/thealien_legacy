'use strict';

define(['core/input', 'core/messenger'], function (InputManager, Messenger) {

    /**
     * TODO: remove these when they're implemented for real
     *
     * @typedef {Object} Scene
     * @typedef {Object} System
     */


    // find requestNextFrame if available, or just default to a 60fps timeout
    var nextFrame = window.requestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    function (cb) {
                        return window.setTimeout(cb, 1000 / 60);
                    };

    /**
     * Creates a new Game instance using the specified options.
     *
     * A Game instance consists of the following modules:
     *  - A Component registry
     *  - An ordered list of loopphases
     *  - A scene index (indexed by identifier)
     *  - A system index (lists of systems indexed by loopphase)
     *
     * Games also hold reference to a rendering context (defined by the options),
     * an input processor, a message manager, and its internal state (running, paused, stopped)
     *
     * @param {Object}        options
     * @param {Object|string} options.canvas        the html canvas element, or its id
     * @param {Array<string>} options.loopphases    a list of loopphases to iterate through
     * @returns {Game}
     * @constructor
     */
    function Game(options) {
        if (!(this instanceof Game)) {
            return new Game(options);
        }

        /**
         * @type {Object}
         */
        this.ctx = {};


        /**
         * @type {number}
         * @private
         */
        this._currentComponentBit = 1;

        /**
         * @type {Object.<string,number>}
         * @private
         */
        this._componentFlags = {};

        /**
         *
         * @type {Array<string>}
         * @private
         */
        this._loopphases = [];

        /**
         * @type {Object.<string,Scene>}
         */
        this.scenes  = {};

        /**
         * @type {Object.<string,Array<System>>}
         */
        this.systems = {};

        /**
         * @type {Scene}
         */
        this.activeScene = null;


        /**
         * @type {boolean}
         * @private
         */
        this.__running = false;


        /**
         * dirty flag to watch for new systems added during execution
         * @type {boolean}
         * @private
         */
        this.__uninitialized_systems = true;

        options = options || {};

        // load canvas from options
        if (options.canvas) {
            if (typeof options.canvas === "string") {
                this.ctx = document.getElementById(options.canvas).getContext('2d');
            } else {
                this.ctx = options.canvas.getContext('2d');
            }
        } else {
            console.error('No canvas specified');
        }


        // load loopphases from options
        if (options.loopphases && options.loopphases.length) {
            this._loopphases = options.loopphases;
        }


        // init input manager
        InputManager.init(this.ctx.canvas);

    }


    Game.prototype = {
        /**
         * Adds a component type to the component registry, returning the component's
         * registry key
         *
         * @param {Component} component   the component being registered
         * @param {string} componentName  the name of the component being registered
         * @returns {number}              the registered key for that component
         */
        registerComponent: function (component, componentName) {
            if (this._componentFlags.hasOwnProperty(componentName)) {
                console.error('Attempt to register component of same name', componentName);
                return this._componentFlags[componentName];
            }
            if (this._currentComponentBit === 1 << 31) {
                console.error('Maximum components registered');
                return 0;
            }
            this._componentFlags[componentName] = this._currentComponentBit;
            this._currentComponentBit = this._currentComponentBit << 1;

            //set the flag on the component (this is the only reason we need the component as a parameter)
            component.flag = this._componentFlags[componentName];

            return this._componentFlags[componentName];
        },

        /**
         * Appends a system to the execution list for the specified loopphase
         * @param {System} system      the system to execute
         * @param {string} loopphase   the phase of the game loop where the system should be called
         */
        addSystem: function(system, loopphase) {
            if (!this.systems.hasOwnProperty(loopphase)) {
                this.systems[loopphase] = [];
            }
            this.__uninitialized_systems = true;
            system.__initialized = false;
            this.systems[loopphase].push(system);
        },

        /**
         * Inserts a new loopphase at the index.  The loopphases after the insertion are
         * moved one step back in the execution order
         *
         * @param {number} index        the position in the execution order
         * @param {string} name         the name of the loopphase
         * @returns {Array.<string>}    the new loopphase list
         */
        addLoopphase: function (index, name) {
            this._loopphases.splice(index, 0, name);
            this.systems[name] = [];
            return this._loopphases;
        },

        /**
         * Adds a scene to the scene dictionary
         *
         * @param {Scene}  scene    the scene to add
         * @param {string} name     the identifier of the scene
         */
        addScene: function (scene, name) {
            if (!name) {
                console.error('Scene must have a name');
            } else {
                if (this.scenes[name]) {
                    console.error('Scene with that name (' + name + ') already exists');
                } else {
                    if (!scene.msg) {
                        scene.msg = Messenger;
                    }
                    if (!scene.input) {
                        scene.input = InputManager.State;
                    }
                    if (!scene.renderTarget) {
                        scene.renderTarget = this.ctx;
                    }
                    this.scenes[name] = scene;
                }
            }
        },

        /**
         * Begins the execution of the game loop
         */
        run: function () {
            if (!this.__running) {
                this.__running = true;
                this.step(0);
            }
        },

        /**
         * Sets the active scene
         * @param {string} name  The name of the scene
         */
        setActiveScene: function (name) {
            if (!this.scenes[name]) {
                console.error('Scene (' + name + ') does not exist');
            } else {
                this.activeScene = this.scenes[name];
                this.__uninitialized_systems = true;
            }
        },

        /**
         * Halts the execution of the game loop
         */
        stop: function () {
            if (this.__running) {
                this.__running = false;
            }
        },

        /**
         * Iterates the game loop once, then recursively calls itself (based on
         * nextFrame as defined above)
         * @param {number} time     the timestamp of the last step() call
         */
        step: function(time) {
            var currTime, game, dt, i, j, l, m;

            currTime = new Date().getTime();
            game = this;

            // Execute a game step
            if (time !== 0) {

                //dirty uninitialized system check
                while (this.__uninitialized_systems) {
                    this.initializeNewSystems();
                }

                dt = currTime - time;

                InputManager.processInput();

                l = this._loopphases.length;
                for (i = 0; i < l; i += 1) {
                    m = this.systems[this._loopphases[i]].length;
                    for (j = 0; j < m; j += 1) {
                        if (this.systems[this._loopphases[i]][j].__initialized) {
                            this.systems[this._loopphases[i]][j].step(this.activeScene, dt);
                        }
                    }
                }
            }

            if (this.__running) {
                nextFrame(this.step.bind(game, currTime));
            }
        },

        initializeNewSystems: function () {
            var i, j, l, m, loopphase, system;
            l = this._loopphases.length;
            for (i = 0; i < l; i += 1) {
                loopphase = this._loopphases[i];
                m = this.systems[loopphase].length;
                for (j = 0; j < m; j += 1) {
                    system = this.systems[loopphase][j];
                    if (!system.__initialized) {
                        system.init(this.activeScene, this._componentFlags);
                        system.__initialized = true;
                    }
                }
            }
            this.__uninitialized_systems = false;
        }
    };

    return Game;
});
