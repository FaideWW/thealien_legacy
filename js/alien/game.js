define(['underscore', 'alien/logging', 'alien/systems/render', 'alien/systems/collision', 'alien/systems/messaging',
        'alien/systems/event', 'alien/systems/interface', 'alien/systems/physics',
        'alien/systems/animation', 'alien/utilities/math',
        'alien/components/renderable'], function (_, Log, Render, Collider, Messaging, Event, UI, Physics, Animation, M, RF) {
    'use strict';
    var root = window,
        requestNextFrame = (function () {
            return (root.requestAnimationFrame ||
                root.webkitRequestAnimationFrame ||
                root.mozRequestAnimationFrame ||
                root.oRequestAnimationFrame ||
                root.msRequestAnimationFrame ||
                function (cb) {
                    root.setTimeout(cb, 1000 / 60);
                }
                );
        }()),
        time = function () {
            return (new Date()).getTime();
        },
        states = {
            STOPPED: 0,
            RUNNING: 1,
            PAUSED:  2
        },
        supportedEvents = [
            'click',
            'mousedown',
            'mouseup',
            'mousemove',
            'keydown',
            'keyup',
            'blur',
            'focus'
        ],
        fps_array = [],
        fps_iterations = 0,
        fps_max   = 300,
        Game = (function () {

            /**
             * required options
             *  canvas - the canvas DOM element
             *
             * possible options
             *  fps - how many game loop iterations should run per second [default: 60]
             *  scenes - a list of scenes in the game (these can be loaded later as well)
             *
             */
            function Game(options) {

                //enforces the use of new
                if (!(this instanceof Game)) {
                    return new Game(options);
                }

                options = options || {};

                if (!options.canvas) {
                    return Log.log('No canvas specified');
                }

                if (!options.canvas.getContext) {
                    return Log.log('Canvas element has no context');
                }

                this.canvasContext = options.canvas.getContext('2d');
                this.fps = options.fps || 60;
                this.frametime = 1000 / this.fps;
                this.autopause = options.autopause || false;
                this.timeSince = 0;
                this.totalTime = 0;

                this.scenes = {};
                if (options.scenes) {
                    if (options.scenes.length) {
                        _.each(options.scenes, function (scene) {
                            this.addScene(scene);
                        }, this);
                    } else {
                        this.scenes = options.scenes;
                    }
                }

                this.activeScene = null;

                this.state = states.STOPPED;
                this.canvas_width = options.canvas.width;
                this.canvas_height = options.canvas.height;

            }

            Game.prototype = {
                addScene: function (scene) {
                    this.scenes[scene.id] = scene;
                    return this;
                },
                removeScene: function (scene_id) {
                    this.scenes[scene_id] = null;
                    return this;
                },
                loadScene: function (scene_id) {
                    this.activeScene = scene_id;

                    Render.init(this.canvasContext, this.canvas_width, this.canvas_height);
                    Messaging.init();
                    Event.init(supportedEvents);
                    UI.init(this.scenes[scene_id].getAllWithOneOf(['keylistener', 'mouselistener']));
                    Physics.init(this.scenes[scene_id]);
                    Animation.init(this.scenes[scene_id]);

                    /* Enable pause when the window loses focus */
                    if (this.autopause) {
                        Event.on(this, 'blur', function () {
                            if (this.state === states.RUNNING) {
                                this.state = states.PAUSED;
                                this.pause();
                                Render.draw(new M.Vector({x: this.canvas_width / 2, y: this.canvas_height / 2}), RF.createRenderRectangle(this.canvas_width, this.canvas_height, null, "rgba(0,0,0,0.5)"));
                                Log.log("Paused");
                            }
                        });
                        Event.on(this, 'focus', function () {
                            if (this.state === states.PAUSED) {
                                this.state = states.RUNNING;
                                this.run();
                            }
                        });
                    }
                    return this;
                },
                run: function () {
                    if (!this.activeScene) {
                        return Log.log("No scene loaded");
                    }
                    if (this.state !== states.RUNNING) {
                        if (this.state === states.STOPPED) {
                            this.state = states.RUNNING;
                            this.step(new Date().getTime());
                        } else {
                            this.state = states.RUNNING;
                        }
                    }
                },
                pause: function () {
                    if (this.state === states.RUNNING) {
                        this.state = states.PAUSED;
                        console.log('paused');
                    }
                },
                stop: function () {
                    if (this.state !== states.STOPPED) {
                        this.state = states.STOPPED;
                        root.clearTimeout(this.loopID);
                        Log.log('stopped');
                        Log.clearLog();
                    }
                },

                step: function (t) {
                    if (this.state !== states.STOPPED) {
                        //continue to track time
                        var currTime = new Date().getTime(),
                            dt = currTime - t,
                            g;

                        if (this.state === states.RUNNING) {
                            //main game loop
                            this.timeSince += dt;
                            this.totalTime += dt;
                            if (this.timeSince >= this.frametime) {
                                /*
                                Check for pause-delay hacks/glitches

                                 If the delay between steps is greater than five expected frame iterations, there is a
                                 high probability that unexpected behavior will occur when the logic resumes.  In this
                                 scenario, we need to perform more expensive contingency operations.  These include:

                                    Continuous sweeping collision detection
                                    ...
                                 */
                                Event.step(this.scenes[this.activeScene], dt);


                                if (this.timeSince / this.frametime >= 5) {
                                    console.log('skip');
                                    Collider.speculativeContact(this.scenes[this.activeScene], dt);
                                }
                                this.timeSince = this.timeSince % this.frametime;

                                Physics.step(this.scenes[this.activeScene], dt);
                                Collider.step(this.scenes[this.activeScene], dt);
                                Physics.resolveCollision();
                                Messaging.step(this, dt);
                            }
                            Animation.step(this.scenes[this.activeScene], dt);
                            Render.step(this.scenes[this.activeScene], dt);
                            fps_array[fps_iterations] = dt;
                            fps_iterations = (fps_iterations + 1) % fps_max;
                            Log.fps((1000 * fps_array.length / _.reduce(fps_array, function (sum, n) { return n + sum; }, 0)));
                            Log.log(this.scenes[this.activeScene].entities.player.movable.velocity.toString());
                        }
                        g = this;
                        this.loopID = requestNextFrame(function () { g.step(currTime); });
                    }
                }
            };

            return Game;
        }());

    return Game;
});