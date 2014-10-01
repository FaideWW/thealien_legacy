/**
 * Created by faide on 2014-09-05.
 */

'use strict';

/**
 */
define([], function () {
    // TODO: this is a placeholder for creating a proper component factory with memoization
    var component_cache = {},
        id = function () {
            /** @type {string}
             *    UUID generator from https://gist.github.com/gordonbrander/2230317
             */
            return Math.random().toString(36).substr(2, 9);
        },
        proxify = function (constructor) {
            return function (options) {
                var component = constructor(options);

                if (options && options.track) {
                    component.track = options.track;
                }

                component.reset = function () {
                    var prop;
                    if (component_cache[this.__id]) {
                        for (prop in component_cache[this.__id]) {
                            if (component_cache[this.__id].hasOwnProperty(prop) && prop !== '__id') {
                                this[prop] = component_cache[this.__id][prop];
                            }
                        }
                    }
                };

                return new Proxy(component, {
                    get: function (component, prop) {
                        if (prop in component) {
                            return (typeof component[prop] === 'function' && prop !== 'reset') ? component[prop]() : component[prop];
                        }
                    }
                })
            };
        },
        SquareRenderable = (function () {
            function SquareRenderable(options) {
                if (!(this instanceof SquareRenderable)) {
                    return new SquareRenderable(options);
                }


                options = options || {};
                this.type   = "square";
                this.half_width  = options.half_width  || 25;
                this.half_height = options.half_height || 25;
                this.fill        = options.fill   || null;
                this.stroke      = options.stroke || null;

                this.__id = id();
                component_cache[this.__id] = _.cloneDeep(this);
            }

            return proxify(SquareRenderable);
        }()),
        TextRenderable = (function () {
            function TextRenderable(options) {
                if (!(this instanceof TextRenderable)) {
                    return new TextRenderable(options);
                }

                options = options || {};

                this.type = "text";

                // accept bare string as parameter
                this.text   = (options.text) ? options.text : options;
                this.fill   = options.fill   || null;
                this.stroke = options.stroke || null;
                this.font   = options.font   || null;
                this.__id = id();
                component_cache[this.__id] = _.cloneDeep(this);
            }

            return proxify(TextRenderable);
        }()),
        Position = (function () {
            function Position(options) {
                if (!(this instanceof Position)) {
                    return new Position(options);
                }

                options = options || {};
                this.x = options.x || 0;
                this.y = options.y || 0;
                this.__id = id();
                component_cache[this.__id] = _.cloneDeep(this);
            }

            return proxify(Position);
        }()),
        Rotation = (function () {
            function Rotation(options) {
                if (!(this instanceof Rotation)) {
                    return new Rotation(options);
                }


                options = options || {};
                this.angle = options.angle || 0;
                this.__id = id();
                component_cache[this.__id] = _.cloneDeep(this);
            }

            return proxify(Rotation);
        }()),
        Translation = (function () {
            function Translation(options) {
                if (!(this instanceof Translation)) {
                    return new Translation(options);
                }


                options = options || {};
                this.x = options.x || 0;
                this.y = options.y || 0;
                this.__id = id();
                component_cache[this.__id] = _.cloneDeep(this);
            }

            return proxify(Translation);
        }()),
        Orbital = (function () {
            function Orbital(options) {
                if (!(this instanceof Orbital)) {
                    return new Orbital(options);
                }


                options = options || {};
                this.radius = options.radius || 50;
                this.__id = id();
                component_cache[this.__id] = _.cloneDeep(this);
            }
            return proxify(Orbital);
        }()),
        AABBCollidable = (function () {
            function AABBCollidable(options) {
                if (!(this instanceof AABBCollidable)) {
                    return new AABBCollidable(options);
                }


                this.type = "aabb";
                this.collidedX = false;
                this.collidedY = false;
                this.collided  = false;

                this.collision_data = {};

                options = options || {};
                this.half_width  = options.half_width  || 0;
                this.half_height = options.half_height || 0;
                this.reaction = options.reaction       || "bounce";
                this.__id = id();
                component_cache[this.__id] = _.cloneDeep(this);
            }

            return proxify(AABBCollidable);
        }()),
        Velocity = (function() {
            function Velocity(options) {
                if (!(this instanceof Velocity)) {
                    return new Velocity(options);
                }


                options = options || {};
                this.x = options.x || 0;
                this.y = options.y || 0;
                this.__id = id();
                component_cache[this.__id] = _.cloneDeep(this);
            }

            return proxify(Velocity);
        }()),
        PaddleController = (function() {
            function PaddleController(options) {
                if (!(this instanceof PaddleController)) {
                    return new PaddleController(options);
                }


                options = options || {};

                this.type = "paddle";
                this.direction = options.direction || "y";
                this.__id = id();
                component_cache[this.__id] = _.cloneDeep(this);
            }

            return proxify(PaddleController);
        }()),
        MouseController = (function () {
            function MouseController(options) {
                if (!(this instanceof MouseController)) {
                    return new MouseController(options);
                }


                this.type = "mouse";
                this.__id = id();
                component_cache[this.__id] = _.cloneDeep(this);
            }
            return proxify(MouseController);
        }()),
        Type = (function () {
            function Type(options) {
                if (!(this instanceof Type)) {
                    return new Type(options);
                }


                this.type = options.type || null;
                this.__id = id();
                component_cache[this.__id] = _.cloneDeep(this);
            }
            return proxify(Type);
        }());


    return {
        square_renderable: SquareRenderable,
        text_renderable:   TextRenderable,
        position:          Position,
        rotation:          Rotation,
        translation:       Translation,
        orbital:           Orbital,
        aabb_collidable:   AABBCollidable,
        velocity:          Velocity,
        paddle_controller: PaddleController,
        mouse_controller:  MouseController,
        type:              Type,

        component: function (options) {
            var handler = {
                get: function (component, prop) {
                    if (prop in component) {
                        if (typeof component[prop] === 'function') {
                            // resolve component property if it is a function
                            return component[prop]();
                        }
                        return component[prop];
                    }
                }
            };
            if (typeof Proxy === 'object') {
                throw new Error('Direct Proxy API not supported');
            }
            return new Proxy(options, handler);
        }
    };
});