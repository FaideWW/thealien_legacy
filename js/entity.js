var alien = alien || {};

alien.Entity = function() {
	var global_id = 0;
	var objs = [];
	function newObj() {
		objs.push({
			gid: global_id,
			components: function() {
				var c = [];
				return {
					add: function(component) {
						c[component.ctype] = component;
						return c[component.ctype];
					},
					all: function() {
						return c;
					},
					clone: function() {
						var new_components = [];
						for (var component in c) {
							console.log(c[component]);
							new_c = alien.Component.instances.clone(c[component].ctype, c[component].t_id);
							new_components.push(new_c);
						}
						return new_components;
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
			}()
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
		clone: function(obj) {
			if (obj === undefined) {
				return false;
			}
			var new_obj = newObj();
			var cs = obj.components.clone();
			for (var c in cs) {
				new_obj.components.add(cs[c]);
			}
			return new_obj;
		},
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