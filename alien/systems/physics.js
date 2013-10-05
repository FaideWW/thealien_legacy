var alien = alien || {};

alien.systems = alien.systems || {};

alien.systems.PhysicsSystem = (function() {
	'use strict';

	var gravity = new alien.Math.Vector({
		y: 9 //9 px*s^(-2)
	}), 
		update_freq = 1000 / 60,
		time_since_last_update = 0;

	var PhysicsSystem = {
		update: function(dt, g) {
			time_since_last_update += dt;
			if (time_since_last_update >= update_freq) {
				//do collision checking
				for (var i = 0; i < g.scene.entities.length; i += 1) {
					g.scene.entities[i].physicsUpdate(dt);
				}

				time_since_last_update = 0;
			}
		},
		testCollision: function(e1, e2) {
			var collides = false;

			for (var i = 0; i < e1.collidables.length; i++) {
				for (var j = 0; j < e2.collidables.length; j++) {
					if (alien.systems.CollisionSystem.collide(e1[i], e2[j]) !== false) {
						collides = true;
						e1.collideWith(e2);
					} 
				}
			}
		} 
	}

	alien.Entity.default_properties.velocity = new alien.Math.Vector();
	alien.Entity.default_properties.acceleration = new alien.Math.Vector();
	alien.Entity.default_properties.massless = true;
	alien.Entity.default_properties.on_ground = false;
	alien.Entity.default_properties.friction = 0;

	alien.Entity.prototype.collideWith = function(e) {

	}

	alien.Entity.prototype.physicsUpdate = function(dt) {
		this.position = this.position.add(this.velocity.mul(dt / 1000));
		this.velocity = this.velocity.add(this.acceleration.mul(dt / 1000)).mul(1 - this.friction);

		if (!this.massless && !this.on_ground) {
			this.acceleration = this.acceleration.add(gravity.mul(1000 / dt));
		}
	};

	return PhysicsSystem;

}());