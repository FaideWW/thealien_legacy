define(["../entity"], function(Entity) {


	/**
	 * alien.systems.BehaviorSystem
	 *
	 * properties
	 * ~ update_frequency : Number - the number of milliseconds to elapse between
	 * 								 updates ^
	 * ~ time_since_last_update : Number - the number of milliseconds elapsed since
	 * 									   the last update
	 *
	 * methods
	 * ~ BehaviorSystem.update ( dt : Number, g : alien.Game )
	 * 	  - on the fixed time interval, broadcasts a behaviorUpdate command to 
	 * 	  	all entities in the current game's scene.
	 *
	 * BehaviorSystem manages "scripts" that can be attached to entities and
	 * set to run at a fixed time interval (at the moment this is set to 60Hz).
	 *
	 * Scripts canvas a wide variety of functionalities, including event-driven
	 *  beahviors (drag and drop), movement effects (oscillation), even
	 *  multi-entity functions (drawing a line between two entities). 
	 *
	 * For more information on scripts, see alien.Behavior
	 *
	 * BehaviorSystem attaches a function behaviorUpdate to the Entity prototype
	 * which is given the timedelta and the current scene object.  This loops
	 * through the Entity's behavior array (which is attached to 
	 * alien.Entity.default_properties by BehaviorSystem) and calls each one 
	 * sequentially.
	 *
	 * ^  the name is a misnomer since it technically defines the update _period_,
	 * 	  but whatever.
	 *
	 * todo
	 * - behavior priorities
	 * - dynamic interval scheduling for behavior scripts
	 * 
	 */

	var BehaviorSystem = (function() {
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

		Entity.prototype.behaviorUpdate = function(dt, scene) {
			for (var i = 0; i < this.behaviors.length; i += 1) {
				this.behaviors[i].update(this, scene, dt);
			}
		};

	    Entity.default_properties.behaviors = [];

		return BehaviorSystem;

	}());
	return BehaviorSystem
});