alien = alien || {};

alien.Component = function(groups, factories, instances) {
	var f = [],
	i = [];
	return {
		factories: factories || function() {
			return {
				add: function(factory) {
					if (factory.id in f) {
						return false;
					}
					f[factory.id] = factory;
					i[factory.id] = [];
					return f[factory.id];
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
			return {
				create: function(type, properties) {
					if (!(type in i)) {Nia Sophia 
						return false;
					}
					var component = f[type].create(properties);
					return i[type].push(component);
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