var alien = alien || {};

alien.Entity = function() {
	var global_id = 0;
	var objs = [];
	function newObj() {
		objs.push({
			gid: global_id,
			behaviors: function() {
				var b = [];
				return {
					add: function(behavior) {
						b.push(behavior);
						behavior.b_id = b.length-1;
						return b[b.length-1];
					},
					all: function() {
						return b;
					},
					clone: function() {
						//TODO: implement
					},
					get: function(behavior_id) {
						return b[behavior_id];
					},
					remove: function(behavior_id) {
						if (behavior_id in b) {
							b[behavior_id].unbind();
							delete b[behavior_id];
							return true;
						} else {
							return false;
						}
					},
					removeAll: function() {
						b = [];
					}

				};
			}(),
			components: function() {
				var c = {};
				return {
					add: function(component) {
						c[component.componentname] = component;
						return c[component.ctype];
					},
					all: function() {
						return c;
					},
					clone: function() {
						var new_components = {};
						for (var component in c) {
							new_c = alien.Component.instances.clone(c[component].ctype, c[component].t_id);
							new_components[component] = new_c;
						}
						return new_components;
					},
					get: function(componentname) {
						return c[componentname];
					},
					has: function(componentname) {
						if (componentname in c) {
							return true;
						} else {
							return false;
						}
					},
					remove: function(component_id) {
						if (c[component_id].componentname in c) {
							delete c[c[component_id].componentname];
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