var alien = alien || {};
alien.systems = alien.systems || {};

alien.systems.BehaviorSystem = (function() {
	'use strict';

	var update_frequency = 1000 / 60,
		time_since_last_update = 0;

	var BehaviorSystem = {
		update: function(dt, g) {
			time_since_last_update += dt;
			if (time_since_last_update >= update_frequency) {
				time_since_last_update = 0;
				var entities = g.scene.entities;
				for (var i = 0; i < entities.length; i += 1) {
					entities[i].behaviorUpdate(dt, g.scene);
				}
			}
		}
	};

	alien.Entity.prototype.behaviorUpdate = function(dt, scene) {
		for (var i = 0; i < this.behaviors.length; i += 1) {
			this.behaviors[i].update(this, scene, dt);
		}
	};

    alien.Entity.default_properties.behaviors = [];

	return BehaviorSystem;

}());