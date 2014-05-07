var alien = alien || {};

alien.Physics = function() {
    var entities = [];
    return {
        loadScene: function(scene) {
            entities = scene.entities;
        },
        unloadScene: function() {
            entities = [];
        },
        update: function(dt) {
            for (var e in entities) {
                var entity = entities[e];
                if (entity.components.has('position') && entity.components.has('velocity')) {
                    var v = entity.components.get('velocity'),
                        p = entity.components.get('position'),
                        r = dt / 1000;
                    if (entity.components.has('acceleration')) {

                        var a = entity.components.get('acceleration');
                        //change velocity before position
                        var interpolated_acceleration = {
                            x: a.x * r,
                            y: a.y * r,
                            z: a.z * r
                        };

                        v.x = v.x + interpolated_acceleration.x;
                        v.y = v.y + interpolated_acceleration.y;
                        v.z = v.z + interpolated_acceleration.z;
                    }

                    var interpolated_velocity = {
                        x: v.x * r,
                        y: v.y * r,
                        z: v.z * r
                    };

                    p.x = p.x + interpolated_velocity.x;
                    p.y = p.y + interpolated_velocity.y;
                    p.z = p.z + interpolated_velocity.z;

                }
            }
        }
    };

}();

var PositionFactory = function(options) {
    options = options || {};
    options.componentname = "position";
    options.x = options.x || 50;
    options.y = options.y || 50;
    options.z = options.z || 0;
    return options;
};

var VelocityFactory = function(options) {
    options = options || {};

    options.componentname = "velocity";
    options.x = options.x || 0;
    options.y = options.y || 0;
    options.z = options.z || 0;
    return options;
};

var AccelerationFactory = function(options) {
    options = options || {};

    options.componentname = "acceleration";
    options.x = options.x || 0;
    options.y = options.y || 0;
    options.z = options.z || 0;
};