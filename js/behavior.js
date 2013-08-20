var alien = alien || {};

alien.Behavior = function() {
	var entities = {};
	return {
		loadScene: function(scene) {
			this.unloadScene();
			for (var e in scene.entities) {
				this.watch(scene.entities[e]);
			}
		},
		unloadScene: function() {
			entities = {};
		},
		unwatch: function(entity) {
			if (entity.gid in entities) {
				delete entities[entity.gid];
			}
		},
		update: function(dt) {
			for (var e in entities) {
				var behaviors = entities[e].behaviors.all();
				for (var b in behaviors) {
					behaviors[b].update(dt);
				}
			}
		},
		watch: function(entity) {
			if (!(entity.gid in entities)) {
				entities[entity.gid] = entity;
				var behaviors = entity.behaviors.all();
				for (var behavior in behaviors) {
					behaviors[behavior].bind(entity);
				}
			}
		}
	};
}();

var DragDropBehavior = function() {
	return function() {
		var e;
		var c;
		return {
			bind: function(entity) {

				e = entity;
				console.log(e);
				c = entity.components.all();
				console.log(c);

				if (e.components.has('listener') && e.components.has('position')) {
					console.log('binding dragdrop to ' + e.gid);
					e.is_dragging = false;
					var l = e.components.get('listener'),
						p = e.components.get('position');
					l.events.mousedown = l.events.mousedown || [];
					l.events.mousedown.push(function(ev) {
						console.log('activating dragdrop on: ' + e.gid);
						e.is_dragging = true;
						e.mouse_src = {
							x: ev.layerX,
							y: ev.layerY
						};
						e.entity_src = {
							x: p.x,
							y: p.y
						};
					});
					l.events.mouseup = l.events.mouseup || [];
					l.events.mouseup.push(function(ev) {
						console.log('dragging on: ' + e.gid);
						e.is_dragging = false;
					});

					l.events.mousemove = l.events.mousemove || [];
					l.events.mousemove.push(function(ev) {
						if (e.is_dragging) {
							var rel_mouse = {
								x: ev.layerX - e.mouse_src.x,
								y: ev.layerY - e.mouse_src.y
							};
							p.x = e.entity_src.x + rel_mouse.x;
							p.y = e.entity_src.y + rel_mouse.y;
						}
					});

					console.log(l.events);
				} else {
					return false;
				}
			},
			unbind: function(e) {

			},
			update: function() {

			}
		};
	}();
};

var OscillateBehavior = function(period, amplitude, angle) {
	return (function (period, amplitude, angle) {
		var e, c, src_position,
			p = period || 5000, //in ms
			i = amplitude || 50, //in px
			a = angle || 90, //in deg
			rad = a * Math.PI / 180;
			t = 0.5, //current time through period [0,1]
			paused = false;

		var calculateDeltas = function(dt) {
			var ratio = dt / p;
			t += ratio;
			t = t % 1;
			var osc_t = (t * 4 * Math.PI) - (2 * Math.PI);

			var amp_delta = Math.sin(osc_t) * i;
			return {
				x: Math.cos(rad) * amp_delta,
				y: Math.sin(rad) * amp_delta
			};
		};

		return {
			bind: function(entity) {
				console.log('binding oscillate behavior to:');
				console.log(entity);
				e = entity;
				if (e.components.has('listener') && e.components.has('position')) {
					src_position = {
						x: e.components.get('position').x,
						y: e.components.get('position').y
					};
					e.components.get('listener').events.mousedown = e.components.get('listener').events.mousedown || [];
					e.components.get('listener').events.mousedown.push(function(ev) {
						paused = true;
					});
					e.components.get('listener').events.mouseup = e.components.get('listener').events.mouseup || [];
					e.components.get('listener').events.mouseup.push(function(ev) {
						//redefine src position in case it has been moved
						deltas = calculateDeltas(0);
						src_position = {
							x: e.components.get('position').x - deltas.x,
							y: e.components.get('position').y - deltas.y
						};
						paused = false;
					});
				}else{
					return false;
				}
			},
			togglePause: function() {
				paused = !paused;
			},
			unbind: function(e) {

			},
			update: function(dt) {
				if (!paused) {
					
					var pos_delta = calculateDeltas(dt);
					e.components.get('position').x = src_position.x + pos_delta.x;
					e.components.get('position').y = src_position.y + pos_delta.y;
				}
			}
		};
	})(period, amplitude, angle);
};