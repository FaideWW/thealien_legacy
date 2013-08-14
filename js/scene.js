var alien = alien || {};

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