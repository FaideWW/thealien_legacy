var alien = alien || {};

alien.Behavior = function() {
	var init = false,
		behaviors = {},
		components = {};
	return {
		add: function(entity, behavior) {
			behaviors[entity] = behaviors[entity] || [];
			behaviors[entity].push(behavior);
			return behavior.bind(entity, components);
		},
		init: function(c) {
			init = true;
			components = c;
		},
		update: function(dt) {
			for (var e in behaviors) {
				for (var b in behaviors[e]) {
					behaviors[e][b].update(dt);
				}
			}
		}
	};
}();

var DragDropBehavior = function() {
	return {
		create: function() {
			var entity;
			return {
				bind: function(e, c) {
					entity = e;
					if (e.components.has(c.listener) && e.components.has(c.position)) {
						e.is_dragging = false;
						e.components.get(c.listener).events.mousedown = e.components.get(c.listener).events.mousedown || [];
						e.components.get(c.listener).events.mousedown.push(function(ev) {
							console.log('mousedown');
							e.is_dragging = true;
							e.mouse_src = {
								x: ev.layerX,
								y: ev.layerY
							};
							e.entity_src = {
								x: e.components.get(c.position).x,
								y: e.components.get(c.position).y
							};
						});
						e.components.get(c.listener).events.mouseup = e.components.get(c.listener).events.mouseup || [];
						e.components.get(c.listener).events.mouseup.push(function(ev) {
							console.log('mouseup');
							console.log(e.components.get(c.position));
							e.is_dragging = false;
						});

						e.components.get(c.listener).events.mousemove = e.components.get(c.listener).events.mousemove || [];
						e.components.get(c.listener).events.mousemove.push(function(ev) {
							if (e.is_dragging) {
								console.log('mousemove');
								var rel_mouse = {
									x: ev.layerX - e.mouse_src.x,
									y: ev.layerY - e.mouse_src.y
								};
								console.log(rel_mouse);
								e.components.get(c.position).x = e.entity_src.x + rel_mouse.x;
								e.components.get(c.position).y = e.entity_src.y + rel_mouse.y;
							}
						});
					}
					return false;
				},
				unbind: function(e) {

				},
				update: function() {

				}
			};
		}
	};
}();

var OscillateBehavior = function() {
	return {
		create: function(period, amplitude, angle) {
			var e;
			var c;
			var p = period || 5000; //in ms
			var i = amplitude || 50; //in px
			var a = angle || 90; //in deg
			var rad = a * Math.PI / 180;

			var t = 0.25; //current time through period [0,1]
			var src_position;
			return {
				bind: function(entity, components) {
					console.log('binding oscillate behavior to obj');
					e = entity;
					c = components;
					if (e.components.has(c.listener) && e.components.has(c.position)) {
						src_position = {
							x: e.components.get(c.position).x,
							y: e.components.get(c.position).y
						};
						console.log(src_position);
					}else{
						return false;
					}
				},
				unbind: function(e) {

				},
				update: function(dt) {
					var ratio = dt / p;
					t += ratio;
					t = t % 1;
					var osc_t = (t * 4 * Math.PI) - (2 * Math.PI);

					var amp_delta = Math.sin(osc_t) * i;

					var pos_delta = {
						x: Math.cos(rad) * amp_delta,
						y: Math.sin(rad) * amp_delta
					};
					e.components.get(c.position).x = src_position.x + pos_delta.x;
					e.components.get(c.position).y = src_position.y + pos_delta.y;
				}
			};
		}
	};
}();