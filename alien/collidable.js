var alien = alien || {};

alien.components = alien.components || {};

alien.components.collidable = (function() {
    'use strict';

    var collidable = {
        /**
         * AABB
         * - half_width : Number - distance from the origin to the horizontal
         *                         edge of the boundingbox
         * - half_height : Number - distance from the origin to the vertical
         *                          edge of the bounding box
         * - origin : alien.Math.Vector - the offset from the Entity's position
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
                this.half_width = deepClone(args.half_width) || 0;
                this.half_height = deepClone(args.half_height) || 0;
                this.origin = deepClone(args.origin) || new alien.Math.Vector();
            }
        
            AABB.prototype.getPoints = function() {
                return [
                    new alien.Math.Vector({
                        x: -this.half_width + this.origin.x,
                        y: -this.half_height + this.origin.y
                    }),
                    new alien.Math.Vector({
                        x: this.half_width + this.origin.x,
                        y: -this.half_height + this.origin.y
                    }),
                    new alien.Math.Vector({
                        x: this.half_width + this.origin.x,
                        y: this.half_height + this.origin.y
                    }),
                    new alien.Math.Vector({
                        x: -this.half_width + this.origin.x,
                        y: this.half_height + this.origin.y
                    }),
                ];
            };

            AABB.prototype.getVectors = function() {
                return [
                    { 
                        source: new alien.Math.Vector({
                            x: -this.half_width + this.origin.x,
                            y: -this.half_height + this.origin.y
                        }),
                        dest:  new alien.Math.Vector({
                            x: this.half_width + this.origin.x,
                            y: -this.half_height + this.origin.y
                        })
                    }, {
                        source: new alien.Math.Vector({
                            x: this.half_width + this.origin.x,
                            y: -this.half_height + this.origin.y
                        }),
                        dest: new alien.Math.Vector({
                            x: this.half_width + this.origin.x,
                            y: this.half_height + this.origin.y
                        })
                    }, {
                        source: new alien.Math.Vector({
                            x: this.half_width + this.origin.x,
                            y: this.half_height + this.origin.y
                        }),
                        dest: new alien.Math.Vector({
                            x: -this.half_width + this.origin.x,
                            y: this.half_height + this.origin.y
                        })
                    }, {
                        source: new alien.Math.Vector({
                            x: -this.half_width + this.origin.x,
                            y: this.half_height + this.origin.y
                        }),
                        dest: new alien.Math.Vector({
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