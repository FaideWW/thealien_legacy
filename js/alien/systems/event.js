define(["../entity", "../game", "../math"], function(Entity, Game, AlienMath) {


    /**
     * alien.systems.EventSystem
     *
     * properties
     * ~ mouse_events : [String] - all listened-for mouse events as defined by
     *                             the browser Event API
     * ~ key_events : [String]   - all listened-for keyboard events as defined by
     *                             the browser Event API
     * ~ isDragEvent : Boolean   - a global flag that shuts down mouse event 
     *                             propagation while a drag event is occuring
     * ~ deltaDrag : AlienMath.Vector - records the (x,y) displacement between a 
     *                                   mousedown and mouseup event.  Used for
     *                                   determining whether or not an event is
     *                                   a click, or a drag.
     * ~ maxDelta : Number       - the threshold tolerance for distinguishing 
     *                             between clicks and drags
     * 
     * methods
     * ~ EventSystem.click ( event : Event, scene : alien.Scene )
     *     - propagates a click event from the window to all entities at the
     *       position of the cursor
     * ~ EventSystem.dblclick ( event : Event, scene : alien.Scene )
     *     - propagates a dblclick event from the window to all entities at the
     *       position of the cursor
     * ~ EventSystem.mousedown ( event : Event, scene : alien.Scene )
     *     - propagates a mousedown event from the window to all entities at the 
     *       position of the cursor
     * ~ EventSystem.mouseup ( event : Event, scene : alien.Scene )
     *     - propagates a mouseup event from the window to all entities at the 
     *       position of the cursor
     * ~ EventSystem.mousemove ( event : Event, scene : alien.Scene ) 
     *     - propagates a mousemove event from the window to all entities over
     *       which the cursor is currently moving
     * ~ EventSystem.mouseover ( event : Event, scene : alien.Scene ) 
     *     - propagates a mouseover event from the window to any entities
     *       listening for a mouseover event.  (Note that this will only trigger
     *       upon mousing over the canvas element on the webpage, so this is useful
     *       for listening for when the canvas gains focus for auto-pausing)
     * ~ EventSystem.mouseout ( event : Event, scene : alien.Scene )
     *     - propagates a mouseout event from the window to the scene.  Sister 
     *       event to EventSystem.mouseover.
     * ~ EventSystem.keydown ( event : Event, scene : alien.Scene )
     *     - propagates a keydown event from the window to any entities in the 
     *       scene listening for a keydown event.
     * ~ EventSystem.keyup ( event : Event, scene : alien.Scene )
     *     - propagates a keyup event from the window to any entities in the 
     *       scene listening for a keyup event
     *
     * EventSystem is the event interface between the window and game objects.
     * Because objects drawn to a canvas context are not tied to the DOM, they cannot
     * directly listen for events from the browser Event API.  EventSystem 
     * listens for any events sent to the canvas, and appropriately broadcasts the 
     * events to the entities in the scene.
     *
     * EventSystem attaches multiple functions to the Entity prototype.
     *
     * on( event : String, callback : Function )
     *  - listens for events of the type `event` (if not already doing so), and 
     *    appends the callback to the list of functions to be called when
     *    the entity receives that event
     *
     * isListeningFor ( event : String )
     *  - returns whether or not an entity has any callbacks associated with `event`
     *
     * trigger ( event : String, data : Object )
     *  - calls all functions associated with `event`, passing them the entity (this) 
     *    and `data`
     *
     * By default, entities only listen for mouse events that occur at their position.
     * Setting the flag Entity.globallyListeningFor[event] will force all events of type
     * `event` to be sent to the entity, regardless of mouse position.
     *
     * Also by default, entities do not propagate mouse events further than themselves
     * ('click-through').  Setting the flag Entity.propagateMouseEvents will enable this
     * option.
     *
     * EventSystem attaches the following to Entity.default_prototypes:
     *  - globallyListeningFor : { String : Boolean }
     *  - propagateMouseEvents : Boolean
     *  - listeners            : { String : Function }
     *
     * These are pretty self-explanatory.
     *
     * EventSystem attaches a function to Game.prototype:
     * - registerEventListeners ( canvas : HTMLElement )
     * This function binds `alien` to the DOM event API, and pipes all events (as listed
     *  in both mouse_events and key_events) to EventSystem.
     *
     * EventSystem also handles all custom events broadcast by the engine and its systems;
     * 'collide' events (sent by alien.systems.PhysicsSystem) are an example of this.
     * 
     *
     * Note: At the moment, EventSystem is different from other alien.systems objects, 
     *  since it is not timestep-based.  Events are immediately passed through 
     *  regardless of the current position in the game loop.  
     *
     * todo
     * - implement an event queue and tie events to the timestep
     * - key combinations as distinct events (may end up being a separate system 
     *     entirely), this also includes modifier keys 
     */
    var EventSystem = function() {

        var mouse_events = [
            'click',
            'dblclick',
            'mousedown',
            'mouseup',
            'mousemove',
            'mouseover',
            'mouseout'
        ],
            key_events = [
            'keydown',
            'keyup',
            'keypress'
        ];

        var isDragEvent = false,
            deltaDrag = new AlienMath.Vector(),
            maxDelta = 5;

        Entity.prototype.on = function (event, callback) {
            this.listeners[event] = this.listeners[event] || [];
            this.listeners[event].push(callback);

            return this;
        };

        Entity.prototype.isListeningFor = function (event) {
            if (this.listeners.hasOwnProperty(event)) {
                return this.listeners[event].length > 0;
            }
            return false;
        };

        Entity.prototype.trigger = function (event, data) {
            if (this.listeners[event]) {
                var i;
                for (i = 0; i < this.listeners[event].length; i += 1) {
                    this.listeners[event][i](this, data);
                }
            }
            
            return this;
        };

        Game.prototype.registerEventListeners = function(canvas) {
            var e, 
                scene = this.scene;
                for (e in EventSystem) {
                    if (EventSystem.hasOwnProperty(e)) {
                        if (mouse_events.indexOf(e) !== -1) {
                            this.canvas.addEventListener(e, function(ev) {
                                EventSystem[ev.type](ev, scene);
                            });
                        } else if (key_events.indexOf(e) !== -1) {
                            document.addEventListener(e, function(ev) {
                                EventSystem[ev.type](ev, scene);
                            });
                        }
                    }
                }
        };

        Entity.default_properties.listeners = {};
        Entity.default_properties.propagateMouseEvents = false;
        Entity.default_properties.globallyListeningFor = {
            'click': false,
            'dblclick': false,
            'mousedown': false,
            'mouseup': false,
            'mousemove': false,
            'mouseover': false,
            'mouseout': false
        };

        function entitiesAtPoint(point, scene, e_type) {
            var entities = scene.entities || [],
                entities_at_point = [];

            for (var i = entities.length - 1; i >= 0; i -= 1) {
                if (entities[i].hasOwnProperty('collidable')) {
                    if (entities[i].collidable.pointIn(point.sub(entities[i].position))) {
                        entities_at_point.push(entities[i]);
                        if (!entities[i].propagateMouseEvents) {
                            break;
                        }
                    }
                }
            }

            if (entities_at_point.length < 1) {
                for (var k = 0; k < entities.length; k++) {
                    if (entities[k].globallyListeningFor[e_type]) {
                        entities_at_point.push(entities[k]);
                    }
                }
            }
            return entities_at_point;
        }

        return {
            click: function(event, scene) {
                if (!isDragEvent) {
                    scene = scene || {};
                    var entities = entitiesAtPoint(new AlienMath.Vector({ x: event.offsetX, y: event.offsetY }), scene, 'click');
                    for (var i = 0; i < entities.length; i += 1) {
                        entities[i].trigger('click', {
                            event: event
                        });
                    }
                }
                isDragEvent = false;
            },
            dblclick: function(event, scene) {
                scene = scene || {};
                var entities = entitiesAtPoint(new AlienMath.Vector({ x: event.offsetX, y: event.offsetY }), scene, 'dblclick');
                for (var i = 0; i < entities.length; i++) {
                    entities[i].trigger('dblclick', {
                        event: event
                    });
                }
            },
            mousedown: function(event, scene) {
                scene = scene || {};
                var entities = entitiesAtPoint(new AlienMath.Vector({ x: event.offsetX, y: event.offsetY }), scene, 'mousedown');
                for (var i = 0; i < entities.length; i++) {
                    entities[i].trigger('mousedown', {
                        event: event
                    });
                }
                deltaDrag.x = event.offsetX;
                deltaDrag.y = event.offsetY;
            },
            mousemove: function(event, scene) {
                scene = scene || {};
                var entities = scene.entities || [],
                    i;
                for (i = 0; i < entities.length; i++) {
                    if (entities[i].isListeningFor('mousemove')) {
                        entities[i].trigger('mousemove', {
                            event: event
                        });
                    }
                }
            },
            mouseup: function(event, scene) {
                scene = scene || {};
                var entities = scene.entities || [];
                for (var i = 0; i < entities.length; i++) {
                    if (entities[i].isListeningFor('mouseup')) {
                        entities[i].trigger('mouseup', {
                            event: event
                        });
                    }
                }
                deltaDrag = deltaDrag.sub(new AlienMath.Vector({
                    x: event.offsetX,
                    y: event.offsetY
                }));
                if (deltaDrag.mag() > maxDelta) {
                    isDragEvent = true;
                }
                deltaDrag = new AlienMath.Vector();
            },
            mouseover: function(event, scene) {
                scene = scene || {};
                var entities = entitiesAtPoint(new AlienMath.Vector({ x: event.offsetX, y: event.offsetY }), scene, 'mouseover');
                for (var i = 0; i < entities.length; i++) {
                    entities[i].trigger('mouseover', {
                        event: event
                    });
                }
            },
            mouseout: function(event, scene) {
                scene = scene || {};
                var entities = entitiesAtPoint(new AlienMath.Vector({ x: event.offsetX, y: event.offsetY }), scene, 'mouseout');
                for (var i = 0; i < entities.length; i++) {
                    entities[i].trigger('mouseout', {
                        event: event
                    });
                }
            },
            keyup: function(event, scene) {
                scene = scene || {};
                var entities = scene.entities || [];
                for (var i = 0; i < entities.length; i++) {
                    if (entities[i].isListeningFor('keyup')) {
                        entities[i].trigger('keyup', {
                            event: event
                        });
                    }
                }
            },
            keydown: function(event, scene) {
                scene = scene || {};
                var entities = scene.entities || [];
                for (var i = 0; i < entities.length; i++) {
                    if (entities[i].isListeningFor('keydown')) {
                        entities[i].trigger('keydown', {
                            event: event
                        });
                    }
                }
            }
        };
    }();
    return EventSystem;
});