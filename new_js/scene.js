var alien = alien || {};

alien.Scene = function(properties) {
    properties = properties || {};
    var t = {};

    t.entities = [];

    for (var k in properties) {
        if (properties.hasOwnProperty(k)) {
            t[k] = properties[k];
        }
    }
    return t;
}

alien.Scene.prototype.extend = function(extension) {
    for (var k in extension) {
        if (extension.hasOwnProperty(k)) {
            this[k] = extension[k];
        }
    }
}

alien.Scene.prototype.addEntity = function(entity) {
    this.entities.push(entity);
    return (this.entities.length - 1);
}

//this is a deceptively expensive operation (O(n)) for large scenes, 
//so use it sparingly.  maybe rewrite later to accept entity indexing
alien.Scene.prototype.find = function(entity) {
    for (var k = 0; k < this.entities.length; k++) {
        if (this.entities[k] === entity) {
            return k;
        }
    }
    return -1;
}

alien.Scene.prototype.removeEntity = function(entity) {
    //if entity is a number
        
}

alien.Scene = function() {
    var none = {
        wrap: false,
        entities: []
    };
    var loaded = none;

    Object.freeze(none);

    return {
        scenes: {
            clone: function(scene) {
                return {
                    wrap: scene.wrap,
                    entities: scene.entities
                };
            },
            create: function(properties) {
                //defaults
                properties = properties || {};
                properties.wrap = properties.wrap || false;
                properties.entities = properties.entities || [];
                return properties;
            }
        },
        current: function() {
            return loaded;
        },
        load: function(scene) {
            this.unload();
            loaded = scene;
        },
        unload: function() {
            loaded = none;
            return none;
        }
    };

}();