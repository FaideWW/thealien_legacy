var alien = alien || {};

alien.Entity = function(properties) {
	properties = properties || {};
	var t = {};
	for (var k in properties) {
		if (properties.hasOwnProperty(k)) {
			t[k] = properties[k];
		}
	}
	return t;
};
alien.Entity.prototype.extend = function(extension) {
	for (var k in extension) {
		if (extension.hasOwnProperty(k)) {
			this[k] = extension[k];
		}
	}
}