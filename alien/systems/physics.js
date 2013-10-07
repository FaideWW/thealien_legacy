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

				this.doCollision(g.scene);

				time_since_last_update = 0;
			}
		},
		doCollision: function(s) {
			var collision;
			for (var i = 0; i < s.entities.length; i += 1) {
				for (var j = i+1; j < s.entities.length; j += 1) {
					collision = this.testCollision(s.entities[i], s.entities[j]);
					if (collision !== 0) {
						s.entities[i].trigger('collide', {
							collision: collision,
							entity: s.entities[j]
						});
						s.entities[j].trigger('collide', {
							collision: collision.mul(-1),
							entity: s.entities[i]
						});
					}
				}
			}
		},
		testCollision: function(e1, e2) {
			return alien.systems.CollisionSystem.collide(e1, e2);
		} 
	}

	alien.Entity.default_properties.velocity = new alien.Math.Vector();
	alien.Entity.default_properties.acceleration = new alien.Math.Vector();
	alien.Entity.default_properties.massless = true;
	alien.Entity.default_properties.on_ground = false;
	alien.Entity.default_properties.friction = 0;
	alien.Entity.default_properties.staticObject = false;

	alien.Entity.prototype.physicsUpdate = function(dt) {
		this.position = this.position.add(this.velocity.mul(dt / 1000));
		this.velocity = this.velocity.add(this.acceleration.mul(dt / 1000)).mul(1 - this.friction);

		if (this.on_ground) {
			this.acceleration.y = 0;
			this.velocity.y = 0;
		}

		if (!this.massless && !this.on_ground) {
			this.acceleration = this.acceleration.add(gravity.mul(1000 / dt));
		}
	};

	return PhysicsSystem;

}());