var alien = alien || {};

alien.Component = function(groups, factories, instances) {
	var f = [],
		i = [],
		p = [],
		factory_id = 1;
	return {
		factories: factories || function() {
			return {
				add: function(factory) {
					f[factory_id] = factory;
					i[factory_id] = [];
					p[factory_id] = [];
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
				clone: function(type, instance_id) {
					if (type in p && instance_id in p[type]) {
						var properties = p[type][instance_id].clone();
						var new_instance = this.create(properties, type);
						// for (var attr in instance) {
						// 	if (instance.hasOwnProperty(attr) && attr !== "t_id") {
						// 		new_instance[attr] = instance[attr];
						// 	}
						// }
						// new_instance["t_id"] = i[type].length;
						// i[type].push(new_instance);
						return new_instance;
					} else {
						return false;
					}
				},
				create: function(properties, type) {
					properties = properties || {};
					type = type || properties.ctype || null;
					if (!(type in i)) {
						return false;
					}
					properties["clone"] = function() {
						var new_opts = {};
						for (var attr in properties) {
							if (properties.hasOwnProperty(attr)) {
								var prop = {};
								if (typeof properties[attr] === 'object') {
									for (var p in properties[attr]) {
										if (properties[attr].hasOwnProperty(p)) {
											prop[p] = properties[attr][p];
										}
									}
								} else {
									prop = properties[attr];
								}
								new_opts[attr] = prop;
							}
						}
						return new_opts;
					};
					properties["g_id"] = global_instance_id++;
					properties["t_id"] = i[type].length;
					var component = f[type](properties);
					var index = i[type].push(component);
					p[type].push(properties);
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

