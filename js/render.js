var alien = alien || {};

alien.Render = function() {
	var init = false;
	var components = {};
	var entities = [];
	function draw() {
		console.log('drawing');
		console.log(entities);
		var c = components.c.getContext('2d');
		for (entity in entities) {
			var e = entities[entity].components.all();
			console.log(e);
			c.fillStyle = e[components.poly].color;
			c.beginPath();
			c.moveTo(e[components.pos].x + e[components.poly].poly[0].x, e[components.pos].y + e[components.poly].poly[0].y);
			for (var i = 1; i < e[components.poly].poly.length; i+=1) {
				c.lineTo(e[components.pos].x + e[components.poly].poly[i].x, e[components.pos].y + e[components.poly].poly[i].y);
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
					console.log(entity.components.has(components.poly));
					console.log(entity.components.has(components.pos));

					if (entity.components.has(components.r) &&
						entity.components.has(components.poly) &&
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
				poly: polygon,
				pos: position
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
	options.x = options.x || 50;
	options.y = options.y || 50;
	options.z = options.z || 0;
	return options;
}

var RenderableFactory = function(options) {
	options = options || {};
	options.rtype = options.rtype || null;
	options.visible = options.visible || true;
	options.z = options.z || 0;
	return options;
}

var PolygonFactory = function(options) {
	options = options || {};
	options.poly = options.poly || [];
	if (!options.poly.length) {
		if (options.shape === "rect") {
			options.width = options.width || 50;
			options.height = options.height || 50;

			//build PolygonFactory properties
			options.poly = [
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