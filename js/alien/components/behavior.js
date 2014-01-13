
define(["../entity", "../components/renderable"], function(Entity, Renderable) {
    var behavior = (function() {
        'use strict';

        var behavior = {
            /**
             * behavior.Follow
             *  - target : Entity
             *  - callback : function
             *  
             * tracks the position of `target` and calls 
             *  `callback` whenever the Entity and `target` are not
             *  at the same position. 
             */
            Follow: (function() {
                'use strict';
            
                function Follow(args) {
                    // enforces new
                    if (!(this instanceof Follow)) {
                        return new Follow(args);
                    }
                    args = args || {};
                    if (!args.hasOwnProperty('target')) {
                        console.error("Follow requires a target");
                        return null;
                    }
                    this.target = args.target;
                    this.callback = args.callback || function() {};
                }
            
                Follow.prototype.update = function(e, dt, s) {
                    if (this.target === 'mouse') {
                        this.target = s.mouse;
                    }
                    if (JSON.stringify(e.getWorldSpacePosition()) !== JSON.stringify(this.target.getWorldSpacePosition())) {
                        e.position = this.target.getWorldSpacePosition();
                        this.callback(e);
                    }
                }

                Follow.prototype.clone = function() {
                    return new Follow(this);
                }
            
                return Follow;
            
            }()),
            /**
             * behavior.Draggable
             *
             * makes the Entity draggable; between a mousedown and mouseup
             *  event, its position will mirror the change in position of 
             *  the mouse cursor.
             */
            Draggable: (function() {
                'use strict';
            
                function Draggable(args) {
                    // enforces new
                    if (!(this instanceof Draggable)) {
                        return new Draggable(args);
                    }
                    args = args || {};
                    this.init = false;
                }
            
                Draggable.prototype.update = function(e, dt, s) {
                    if (!this.init) {
                        e.Draggable = e.Draggable || {};
                        e.on('mousedown', function(e, data) {
                            if (!e.Draggable.isBeingDragged) {
                                e.Draggable.temp = e.Draggable.temp || {};
                                e.Draggable.temp.massless = e.massless;
                                e.massless = true;
                                e.Draggable.isBeingDragged = true;
                                e.Draggable.srcX = data.event.offsetX;
                                e.Draggable.srcY = data.event.offsetY;
                            }
                        }).on('mousemove', function(e, data) {
                            if (e.Draggable.isBeingDragged) {
                                e.position.x += data.event.offsetX - e.Draggable.srcX;
                                e.position.y += data.event.offsetY - e.Draggable.srcY;
                                e.Draggable.srcX = data.event.offsetX;
                                e.Draggable.srcY = data.event.offsetY;
                            }
                        }).on('mouseup', function(e, data) {
                            if (e.Draggable.isBeingDragged) {
                                e.massless = e.Draggable.temp.massless;
                                e.Draggable.isBeingDragged = false;
                            }
                        });
                        this.init = true;
                    }
                }

                Draggable.prototype.clone = function() {
                    return new Draggable(this);
                }
            
                return Draggable;
            
            }()),
        
            /**
             * DrawLineBetween
             * - linewidth : Number - the width of the rendered line
             *
             * allows a line to be drawn from this Entity to any other Entity.
             * 
             * mousedown will generate a line drawn between the Entity and
             * the mouse.
             *
             * mouseup will:
             *     if the mouseup event is on the source Entity, delete the line
             *     if the mouseup event is on another Entity, anchor the line there
             */
            DrawLineBetween: (function() {
                'use strict';
            
                function DrawLineBetween(args) {
                    // enforces new
                    if (!(this instanceof DrawLineBetween)) {
                        return new DrawLineBetween(args);
                    }
                    args = args || {};
                    this.linewidth = args.linewidth || 2;
                    this.init = false;
                }
            
                DrawLineBetween.prototype.update = function(e, dt, s) {
                    if (!this.init) {
                        var lw = this.linewidth;
                        e.DrawLineBetween = e.DrawLineBetween || {}; 
                        e.on('click', function(e, ev) {
                            if (!e.DrawLineBetween.isDrawingLine) {
                                e.DrawLineBetween.line = e.DrawLineBetween.line || [];
                                e.DrawLineBetween.line.push(new Entity({
                                    renderables: [new Renderable.Line({
                                        source: e,
                                        dest: s.mouse,
                                        linewidth: lw
                                    })]
                                }));
                                e.DrawLineBetween.line[e.DrawLineBetween.line.length-1].sceneIndex = s.entities.push(e.DrawLineBetween.line[e.DrawLineBetween.line.length - 1]) - 1;
                                e.DrawLineBetween.isDrawingLine = true;
                                e.globallyListeningFor['click'] = true;
                            } else {
                                if (e.DrawLineBetween.line[e.DrawLineBetween.line.length - 1].renderables[0].dest === s.mouse) {
                                    s.entities.splice(e.DrawLineBetween.line[e.DrawLineBetween.line.length - 1].sceneIndex, 1);
                                    e.DrawLineBetween.line.splice(e.DrawLineBetween.line.length - 1, 1);
                                }
                                e.DrawLineBetween.isDrawingLine = false;
                                e.globallyListeningFor['click'] = false;
                            }
                        });
                        for (var entity in s.entities) {
                            if (s.entities[entity] === e) {
                                continue;
                            }
                            s.entities[entity].on('click', function(f, ev) {
                                if (e.DrawLineBetween.isDrawingLine) {
                                    e.DrawLineBetween.line[e.DrawLineBetween.line.length - 1].renderables[0].dest = f;
                                }
                                e.DrawLineBetween.isDrawingLine = false;
                            });
                        }

                    }
                    this.init = true;
                };

                DrawLineBetween.prototype.clone = function() {
                    return new DrawLineBetween(this);
                }
            
                return DrawLineBetween;
            
            }()),

            Fling: (function() {
                'use strict';

                function Fling(args) {
                    if (!(this instanceof Fling)) {
                        return new Fling(args);
                    }
                    args = args || {};
                    this.init = false;
                };

                Fling.prototype.update = function(e, dt, s) {
                    if (!this.init) {
                        e.Fling = e.Fling || {};
                        e.on('mousedown', function(e, data) {
                            if (!e.Fling.isBeingFlung) {
                                e.Fling.temp = e.Fling.temp || {};
                                e.Fling.temp.massless = e.massless;
                                e.massless = true;
                                e.Fling.isBeingFlung = true;
                                e.Fling.srcX = data.event.offsetX;
                                e.Fling.srcY = data.event.offsetY;
                            }
                        }).on('mousemove', function(e, data) {
                            if (e.Fling.isBeingFlung) {
                                //draw line between
                                
                                e.Fling.srcX = data.event.offsetX;
                                e.Fling.srcY = data.event.offsetY;
                            }
                        }).on('mouseup', function(e, data) {
                            if (e.Fling.isBeingFlung) {
                                //fling
                                e.massless = e.Fling.temp.massless;
                                e.Fling.isBeingFlung = false;
                            }
                        });
                        this.init = true;
                    }
                }


                Fling.prototype.clone = function() {
                    return new Fling(this);
                }

                return Fling;
            }())
        };

        return behavior;

    }());
    return behavior;
})
