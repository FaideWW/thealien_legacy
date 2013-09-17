var alien = alien || {};

alien.Entity = function(properties) {
    //clone any properties into a new object
	properties = properties || {};
	for (var k in properties) {
		if (properties.hasOwnProperty(k)) {
			this[k] = properties[k];
		}
	}
    //if listeners have been cloned over, keep them
    //otherwise start a new list
    this.listeners = this.listeners || [];
};

alien.Entity.prototype.extend = function(extension) {
	for (var k in extension) {
		if (extension.hasOwnProperty(k)) {
			this[k] = extension[k];
		}
	}
};

alien.Entity.prototype.on = function(event, callback) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);
};

alien.Entity.prototype.trigger = function(event, data) {
    if (this.listeners[event]) {
        for (var k = 0; k < this.listeners[event].length; k++) {
            this.listeners[event][i](this, data);
        }
    }
};

alien.Entity.prototype.update = function(dt) {
    this.trigger('update', dt);
};