var alien = alien || {};

alien.Component = function(groups, factories, instances) {
	var f = [],
		i = [],
		factory_id = 1;
	return {
		factories: factories || function() {
			return {
				add: function(factory) {
					f[factory_id] = factory;
					i[factory_id] = [];
					return factory_id++;
				},
				get: function(factory_id) {
					if (factory_id in f) {
						return f[factory_id];
					} else {
						return false;
					}
				},
				remove: function(factory_id) {
					if (factory_id in f) {
						delete f[factory_id];
						return true;
					} else {
						return true;
					}
				}
			};
		}(),
		instances: instances || function () {
			var global_instance_id = 0;
			return {
				create: function(properties, type) {
					properties = properties || {};
					type = type || properties.ctype || null;
					if (!(type in i)) {
						return false;
					}
					properties["g_id"] = global_instance_id++;
					var component = f[type](properties);
					var index = i[type].push(component);
					return i[type][index-1];
				},
				get: function(type, instance_id) {
					if (type in i && instance_id in i[type]) {
						return i[type][instance_id];
					} else {
						return false;
					}
				},
				getAllOfType: function(type) {
					if (!(type in i)) {
						return [];
					} else {
						return i[type];
					}
				},
				remove: function(type, instance_id) {
					if (type in i && instance_id in i[type]) {
						delete i[type][instance_id];
						return true;
					} else {
						return false;
					}
				},
				removeAllOfType: function(type) {
					if (type in i) {
						delete i[type];
						return true;
					} else {
						return false;
					}
				}
			};
		}(),
	};
}();

