var alien = alien || {};

alien.components = alien.components || {};

alien.components.renderable = (function() {
    'use strict';

    var renderable = {
        Polygon: (function() {
            'use strict';

            function Polygon(args) {
                // enforces new
                if (!(this instanceof Polygon)) {
                    return new Polygon(args);
                }
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

        Text: (function() {
            'use strict';
        
            function Text(args) {
                // enforces new
                if (!(this instanceof Text)) {
                    return new Text(args);
                }
                this.color = args.color || "rgba(0,0,0,1)";
                this.font = args.font || "normal 18px sans-serif";
                this.text = args.text || "No text";
            }
        
            Text.prototype.draw = function(args) {
                var p = args.position || new alien.Math.Vector(),
                    c = args.context;
                c.font = this.font;
                c.fillStyle = this.color;
                c.fillText(this.text, p.x, p.y);
            }

            Text.prototype.getBoundingBox = function() {
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
        
        }())

};

return renderable;

}());