var alien = alien || {};

alien.components = alien.components || {};

alien.components.behavior = (function() {
    'use strict';

    var behavior = {
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
        
            Follow.prototype.update = function(e, s, dt) {
                if (this.target === 'mouse') {
                    this.target = s.mouse;
                }
                if (JSON.stringify(e.getPosition()) !== JSON.stringify(this.target.getPosition())) {
                    e.position = this.target.getPosition();
                    this.callback(e);
                }
            }

            Follow.prototype.clone = function() {
                return new Follow(this);
            }
        
            return Follow;
        
        }()),

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
        
            Draggable.prototype.update = function(e, s, dt) {
                if (!this.init) {
                    e.on('mousedown', function(e, data) {
                        if (!e.isBeingDragged) {
                            console.log('drag begin');
                            console.log(e);
                            e.isBeingDragged = true;
                            e.srcX = data.event.layerX;
                            e.srcY = data.event.layerY;
                        }
                    }).on('mousemove', function(e, data) {
                        if (e.isBeingDragged) {
                            console.log('dragging');
                            e.position.x += data.event.layerX - e.srcX;
                            e.position.y += data.event.layerY - e.srcY;
                            e.srcX = data.event.layerX;
                            e.srcY = data.event.layerY;
                        }
                    }).on('mouseup', function(e, data) {
                        if (e.isBeingDragged) {
                            console.log('drag end');
                            e.isBeingDragged = false;
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
    };

    return behavior;

}());

// draggable: {
//         isDraggable: true,
//         isBeingDragged: false,
//         srcX: 0,
//         srcY: 0
//     }
// }).on('mousedown', function(e, data) {
//     if (_.running && e.draggable.isDraggable && !e.draggable.isBeingDragged) {
//         e.draggable.isBeingDragged = true;
//         e.draggable.srcX = data.event.layerX;
//         e.draggable.srcY = data.event.layerY;
//     }
// }).on('mousemove', function(e, data) {
    
//     if (_.running && e.draggable.isBeingDragged) {
//         console.log('dragging');
//         e.position.x += data.event.layerX - e.draggable.srcX;
//         e.position.y += data.event.layerY - e.draggable.srcY;
//         e.draggable.srcX = data.event.layerX;
//         e.draggable.srcY = data.event.layerY;
//     }
// }).on('mouseup', function(e, data) {
//     if (e.draggable.isBeingDragged) {
//         e.draggable.isBeingDragged = false;
//     }
// });