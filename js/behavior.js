var alien = alien || {};

alien.Behavior = function() {
	var init = false,
		behaviors = {},
		components = {};
	return {
		add: function(entity, behavior) {
			behaviors[entity] = behaviors[entity] || [];
			behaviors[entity].push(behavior);
			return behavior().bind(entity, components);
		},
		init: function(c) {
			init = true;
			components = c;
		},
		update: function() {
			for (var e in behaviors) {
				for (var b in behaviors[e]) {
					behaviors[e][b].update();
				}
			}
		}
	};
}();

var DragDropBehavior = function() {
	return function() {
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
							e.components.get(c.position).x = rel_mouse.x;
							e.components.get(c.position).y = rel_mouse.y;
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
	}();
};