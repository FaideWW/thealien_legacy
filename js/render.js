var alien = alien || {};

alien.Render = function() {
	var init = false;
	var components = {};
	var entities = [];
	var canvas_dims = {};
	function draw() {
		var c = components.c.getContext('2d');
		c.clearRect(0, 0, canvas_dims.x, canvas_dims.y);
		for (entity in entities) {
			var e = entities[entity].components.all();
			c.fillStyle = e[components.r].poly.color;
			c.beginPath();
			c.moveTo(e[components.pos].x + e[components.r].poly.points[0].x, e[components.pos].y + e[components.r].poly.points[0].y);
			for (var i = 1; i < e[components.r].poly.points.length; i+=1) {
				c.lineTo(e[components.pos].x + e[components.r].poly.points[i].x, e[components.pos].y + e[components.r].poly.points[i].y);
			}
			c.closePath();
			c.fill();
		}
	}
	return {
		entities: function() {
			return {
				add: function(entity) {
					if (!init) {
						return false;
					}
					console.log(entity.components.has(components.r));
					console.log(entity.components.has(components.pos));

					if (entity.components.has(components.r) &&
						entity.components.has(components.pos)) {
						var index = entities.push(entity);
						return index;
					} else {
						return false;
					}
				},
				remove: function(index) {
					if (init && index in entities) {
						//completely remove (for memory saving reasons)
						entities.splice(index,1);
						return true;
					} else {
						return false;
					}
				}
			};
		}(),
		canvas: function() {
			if (!init) {
				return false;
			} else {
				return components.c;
			}
		},
		init: function(canvas, renderable, polygon, position) {
			init = true;
			components = {
				c: canvas,
				r: renderable,
				pos: position
			};
			canvas_dims = {
				x: canvas.width,
				y: canvas.height
			};
			return init;
		},
		update: function(dt) {
			if (!init) {
				return false;
			}
			draw();
		}
	}
}();

var PositionFactory = function(options) {
	options = options || {};
	options.componentname = "Position";
	options.x = options.x || 50;
	options.y = options.y || 50;
	options.z = options.z || 0;
	return options;
}

var RenderableFactory = function(options) {
	options = options || {};
	options.componentname = "Renderable";
	options.poly = options.poly || null;
	options.visible = options.visible || true;
	options.z = options.z || 0;
	return options;
}

var PolygonFactory = function(options) {
	options = options || {};
	options.componentname = "Polygon";
	options.points = options.points || [];
	if (!options.points.length) {
		if (options.shape === "rect") {
			options.width = options.width || 50;
			options.height = options.height || 50;

			//build PolygonFactory properties
			options.points = [
			{
				x: -options.width / 2,
				y: -options.height / 2
			},
			{
				x: options.width / 2,
				y: -options.height / 2
			},
			{
				x: options.width / 2,
				y: options.height / 2
			},
			{
				x: -options.width / 2,
				y: options.height / 2
			}
			];
		}
	}
	options.color = options.color || "rgba(0,0,0,1)";
	return options;
}