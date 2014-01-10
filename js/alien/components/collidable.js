define(["../global", "../math"], function(Global, AlienMath) {
    var collidable = (function() {
        'use strict';

        var collidable = {
            /**
             * AABB
             * - half_width : Number - distance from the origin to the horizontal
             *                         edge of the boundingbox
             * - half_height : Number - distance from the origin to the vertical
             *                          edge of the bounding box
             * - origin : AlienMath.Vector - the offset from the Entity's position
             *                                to the center of the bounding box
             *
             * Axis-aligned Bounding Box: a quadrilateral for which each face is
             *  aligned to the axis of the coordinate plane: in the case of 
             *  two-dimensional space, the X and Y axes.
             */
            AABB: (function() {
                'use strict';
            
                function AABB(args) {
                    // enforces new
                    if (!(this instanceof AABB)) {
                        return new AABB(args);
                    }
                    args = args || {};
                    this.half_width = Global.deepClone(args.half_width) || 0;
                    this.half_height = Global.deepClone(args.half_height) || 0;
                    this.origin = Global.deepClone(args.origin) || new AlienMath.Vector();
                }
            
                AABB.prototype.getPoints = function() {
                    return [
                        new AlienMath.Vector({
                            x: -this.half_width + this.origin.x,
                            y: -this.half_height + this.origin.y
                        }),
                        new AlienMath.Vector({
                            x: this.half_width + this.origin.x,
                            y: -this.half_height + this.origin.y
                        }),
                        new AlienMath.Vector({
                            x: this.half_width + this.origin.x,
                            y: this.half_height + this.origin.y
                        }),
                        new AlienMath.Vector({
                            x: -this.half_width + this.origin.x,
                            y: this.half_height + this.origin.y
                        }),
                    ];
                };

                AABB.prototype.getVectors = function() {
                    return [
                        { 
                            source: new AlienMath.Vector({
                                x: -this.half_width + this.origin.x,
                                y: -this.half_height + this.origin.y
                            }),
                            dest:  new AlienMath.Vector({
                                x: this.half_width + this.origin.x,
                                y: -this.half_height + this.origin.y
                            })
                        }, {
                            source: new AlienMath.Vector({
                                x: this.half_width + this.origin.x,
                                y: -this.half_height + this.origin.y
                            }),
                            dest: new AlienMath.Vector({
                                x: this.half_width + this.origin.x,
                                y: this.half_height + this.origin.y
                            })
                        }, {
                            source: new AlienMath.Vector({
                                x: this.half_width + this.origin.x,
                                y: this.half_height + this.origin.y
                            }),
                            dest: new AlienMath.Vector({
                                x: -this.half_width + this.origin.x,
                                y: this.half_height + this.origin.y
                            })
                        }, {
                            source: new AlienMath.Vector({
                                x: -this.half_width + this.origin.x,
                                y: this.half_height + this.origin.y
                            }),
                            dest: new AlienMath.Vector({
                                x: -this.half_width + this.origin.x,
                                y: -this.half_height + this.origin.y
                            })
                        }

                    ];
                }

                AABB.prototype.pointIn = function(point) {
                    var offset_point = point.sub(this.origin);
                    
                    return (offset_point.x > (-this.half_width) && offset_point.x < this.half_width &&
                            offset_point.y > (-this.half_height) && offset_point.y < this.half_height);
                };

                AABB.prototype.offset = function(position) {
                    return new AABB({
                        half_width: this.half_width,
                        half_height: this.half_height,
                        origin: position
                    });
                }

                AABB.prototype.clone = function() {
                    return new AABB(this);
                };

                AABB.prototype.getAABB = function() {
                    return this;
                }

                AABB.prototype.preferredTest = "AABBTest";
            
                return AABB;
            
            }())
        }

        return collidable;

    }());

    return collidable;
})