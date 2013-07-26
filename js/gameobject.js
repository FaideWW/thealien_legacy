var alien = alien || {};

alien.GameObject = function() {
	var global_id = 0;
	var objs = [];
	function newObj() {
		objs.push({
			gid: global_id,
			components: function() {
				var c = [];
				return {
					add: function(component) {
						c[component.c_id] = component;
						return c[component.c_id];
					},
					get: function(component_id) {
						return c[component_id];
					},
					has: function(component_id) {
						return (component_id in c);
					},
					remove: function(component_id) {
						if (component_id in c) {
							delete c[component_id];
							return true;
						} else {
							return false;
						}
					},
					removeAll: function() {
						c = [];
					}
				};
			}
		});
		global_id++;
		return objs[global_id-1];
	}

	function delObj(id) {
		if (id in objs) {
			objs[id].components.removeAll();
			delete objs[id];
			return true;
		} else {
			return false;
		}
	}

	return {
		create: function() {
			return newObj();
		},
		get: function(global_id) {
			return objs[global_id];
		},
		remove: function(global_id) {
			return delObj(global_id);
		}
	};
}();