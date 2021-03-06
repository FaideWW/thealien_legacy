'use strict';

define(['core/input', 'core/messenger', 'core/componentfactory', 'core/systemfactory', 'lodash'], function (InputManager, Messenger, CF, SF, _) {

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
         * @type {Object}
         */
        this.__state = {};


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
            throw new Error('No canvas specified');
        }


        // load loopphases from options
        if (options.loopphases && options.loopphases.length) {
            options.loopphases.forEach(function (loopphase, i) {
                this.addLoopphase(i, loopphase);
            }, this)
        }

        if (options.systems) {
            _.each(options.systems, function (system_list, loopphase) {
                system_list.forEach(function (sys) {
                    this.addSystem(sys, loopphase);
                }, this);
            }, this);
        }

        if (options.state) {
            this.__state = options.state;
        }


        // init input manager
        InputManager.init(this.ctx.canvas);
        CF.init(this);
        SF.init(this);

        this.defineSystem = SF.defineSystem;

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
                component.flag = this._componentFlags[componentName];
                return this._componentFlags[componentName];
            }
            if (this._currentComponentBit === 1 << 31) {
                throw new Error('Maximum components registered');
            }
            this._componentFlags[componentName] = this._currentComponentBit;
            this._currentComponentBit = this._currentComponentBit << 1;

            if (component) {
                //set the flag on the component (this is the only reason we need the component as a parameter)
                component.flag = this._componentFlags[componentName];
            }

            return this._componentFlags[componentName];
        },

        /**
         * Appends a system to the execution list for the specified loopphase
         * @param {System} system      the system to execute
         * @param {string} loopphase   the phase of the game loop where the system should be called
         */
        addSystem: function(system, loopphase, __bypass) {
            if (!this.systems.hasOwnProperty(loopphase) || this._loopphases.indexOf(loopphase) === -1) {
                throw new Error("Loopphase " + loopphase + " does not exist");
            }
            if (!__bypass) {
                this.__uninitialized_systems = true;
                system.__initialized = false;
            } else {
                system.__initialized = true;
            }
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
            var g = this;
            if (!name) {
                throw new Error('Scene must have a name');
            } else {
                if (this.scenes[name]) {
                    throw new Error('Scene with that name already exists');
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

                    scene.goTo = function (destination) {
                        scene.reset();
                        g.setActiveScene(destination);
                    };

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
                this.step(new Date().getTime());
            }
        },

        /**
         * Sets the active scene
         * @param {string} name  The name of the scene
         */
        setActiveScene: function (name) {
            if (!this.scenes[name]) {
                throw new Error('Scene does not exist');
            } else {
                this.activeScene = this.scenes[name];
                this.activeScene.gameState = this.__state;
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
            var currTime, game, dt;

            currTime = time;
            game = this;


            // Execute a game step
            if (time && time !== 0) {

                // don't update the current time unless a full game step has occurred
                //  (the previous time should carry through to the next step() call)
                currTime = new Date().getTime();

                //dirty uninitialized system check
                while (this.__uninitialized_systems) {
                    this.initializeNewSystems();
                }

                dt = currTime - time;

                this.__step(dt);
            }

            if (this.__running) {
                nextFrame(this.step.bind(game, currTime));
            }
        },
        __step: function (dt) {
            var i, j, l, m;
            InputManager.processInput();


            if (dt !== 0) {
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
