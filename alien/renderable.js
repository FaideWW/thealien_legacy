var alien = alien || {};

alien.components = alien.components || {};

alien.components.renderable = (function() {
    'use strict';

    var renderable = {
        /**
         * renderable.Polygon
         * - color : String - the color to use when filling the polygon
         * - points : [alien.Math.Vector] - the series of points
         *                                  describing the polygon
         *
         * A closed 2D surface. 
         *
         * renderable.Polygon.draw ( args : Object )
         *     - creates a closed path in the rendering context and fills
         *       it with Polygon.color
         *
         * renderable.Polygon.getBoundingBox (  ) 
         *     - returns the smallest collidable.AABB containing
         *       the entire polygon
         *
         * todo
         * - allow textures (may need to be a separate component)
         * 
         */
         Polygon: (function() {
            'use strict';

            function Polygon(args) {
                // enforces new
                if (!(this instanceof Polygon)) {
                    return new Polygon(args);
                }
                args = args || {};
                this.color = args.color || "rgba(0,0,0,1)";
                this.points = deepClone(args.points) || [
                new alien.Math.Vector()
                ];
            }

            Polygon.prototype.draw = function(args) {
                var p = args.position || new alien.Math.Vector(),
                c = args.context,
                i;
                c.fillStyle = this.color;
                c.beginPath();
                c.moveTo(p.x + this.points[0].x, p.y + this.points[0].y);
                for (i = 1; i < this.points.length; i += 1) {
                    c.lineTo(p.x + this.points[i].x, p.y + this.points[i].y);
                }
                c.closePath();
                c.fill();
            };

            Polygon.prototype.getBoundingBox = function() {
                var maxx = alien.Math.max(this.points, 'x'),
                maxy = alien.Math.max(this.points, 'y'),
                hw = (maxx - alien.Math.min(this.points, 'x')) / 2,
                hh = (maxy - alien.Math.min(this.points, 'y')) / 2,
                origin = new alien.Math.Vector({
                    x: maxx - hw,
                    y: maxy - hh
                });
                return new alien.components.collidable.AABB({
                    half_width: hw,
                    half_height: hh,
                    origin: origin
                });
            };

            Polygon.prototype.clone = function() {
                return new Polygon(this);
            };

            return Polygon;

        }()),
/**
 * renderable.Text
 * - color : String - color of the text
 * - font : String - css-formatted string for the font and font-size
 * - text : String - the text to display
 *
 * renderable.Text.draw ( args : Object ) 
 *     - uses the rendering context's fillText to draw a string to the screen
 *
 * renderable.Text.getBoundingBox ( )
 *     - same as renderable.Polygon.getBoundingBox
 *
 * todo
 * - figure out getBoundingBox
 */
Text: (function() {
    'use strict';

    function Text(args) {
                // enforces new
                if (!(this instanceof Text)) {
                    return new Text(args);
                }
                args = args || {};
                this.color = args.color || "rgba(0,0,0,1)";
                this.font = args.font || "normal 18px sans-serif";
                this.text = args.text || "";
            }

            Text.prototype.draw = function(args) {
                var p = args.position || new alien.Math.Vector(),
                c = args.context;
                c.font = this.font;
                c.fillStyle = this.color;
                var t = '';
                if (typeof this.text === 'function') {
                    t = this.text();
                } else {
                    t = this.text;
                }
                c.fillText(t, p.x, p.y);
            }

            Text.prototype.getBoundingBox = function() {
                //TODO: implement
                return new alien.components.collidable.AABB({
                    half_width: 0,
                    half_height: 0,
                    origin: new alien.Math.Vector()
                });
            }

            Text.prototype.clone = function() {
                return new Text(this);
            };

            return Text;

        }()),

/**
 * renderable.Line
 * - source : alien.Entity - first anchor for the Line
 * - dest : alien.Entity | 'mouse' - second anchor for the Line
 * - color : String - color of the line
 * - linewidth : Number - the width of the line being drawn
 *
 * renderable.Line.prototype.draw ( args : Object )
 *     - uses the rendering context's lineTo to draw a line from
 *       Line.source.getPosition() to Line.dest.getPosition().
 *       if the source or destination is 'mouse', substitute it for
 *       the mouse entity in the scene.
 *
 * renderable.Line.getBoundingBox (  )
 *     - same as renderable.Polygon.getBoundingBox
 *
 * todo
 * - replacing 'mouse' is a little hacky, find a more elegant solution
 * - implement getBoundingBox()
 */
Line: (function() {
    'use strict';

    function Line(args) {
                // enforces new
                if (!(this instanceof Line)) {
                    return new Line(args);
                }
                args = args || {};
                if (!args.hasOwnProperty('source') || !args.hasOwnProperty('dest')) {
                    console.error('Line requires a source and destination');
                    return null;
                }

                this.source = args.source;
                this.dest = args.dest;
                this.color = args.color || "rgba(0,0,0,1)";
                this.linewidth = args.linewidth || 1;
            }

            Line.prototype.draw = function(args) {
                var c = args.context;

                var source_pos, dest_pos;
                
                if (this.source === 'mouse') {
                    this.source = _.scene.mouse;
                }
                if (this.dest === 'mouse') {
                    this.dest = _.scene.mouse;
                }

                if (this.source instanceof alien.Entity) {
                    source_pos = this.source.getPosition();
                } else {
                    source_pos = this.source;
                }
                if (this.dest instanceof alien.Entity) {
                    dest_pos = this.dest.getPosition();
                } else {
                    dest_pos = this.dest;
                }

                c.fillStyle = this.color;
                c.lineWidth = this.linewidth;
                c.beginPath();
                c.moveTo(source_pos.x, source_pos.y);
                c.lineTo(dest_pos.x, dest_pos.y);

                c.stroke();

            };

            Line.prototype.getBoundingBox = function() {
                //TODO: implement
                return new alien.components.collidable.AABB({
                    half_width: 0,
                    half_height: 0,
                    origin: new alien.Math.Vector()
                });
            }

            Line.prototype.clone = function() {
                return new Line(this);
            };

            return Line;

        }()),

/**
 * renderable.Sprite
 * - src : String - the URL to the sprite
 * - width : Number - the width of the sprite, in px
 * - height : Number - the height of the sprite, in px
 *
 * renderable.Sprite.prototype.draw ( args : Object )
 *     - uses the rendering context's drawImage to render 
 *       the sprite
 *
 * renderable.Sprite.prototype.getBoundingBox (  )
 *     - same as renderable.Polygon.prototype.getBoundingBox()
 *
 * todo
 * - spritesheet/animation functionality
 */
Sprite: (function() {
    'use strict';

    function Sprite(args) {
                // enforces new
                if (!(this instanceof Sprite)) {
                    return new Sprite(args);
                }
                args = args || {};
                if (!args.hasOwnProperty('src')) {
                    console.error("Sprite requires a sprite");
                    return null;
                }
                this.img = new Image();
                this.img.loaded = false;
                this.img.onload = function() { this.loaded = true; }
                this.img.src = args.src;
                this.src = args.src;
                this.width = args.width || null;
                this.height = args.height || null;
            }

            Sprite.prototype.draw = function(args) {
                if (this.img.loaded) {
                    var c = args.context,
                    p = args.position,
                    w = (this.width || this.img.width),
                    h =(this.height || this.img.height),
                    img_position = p.sub(new alien.Math.Vector({
                        x: w / 2,
                        y: h / 2
                    }));
                    c.drawImage(this.img, 
                        img_position.x, 
                        img_position.y,
                        w,
                        h);
                }
            }

            Sprite.prototype.getBoundingBox = function() {
                // method body
            }

            Sprite.prototype.clone = function() {
                return new Sprite(this);
            }

            return Sprite;

        }())
};

return renderable;

}());