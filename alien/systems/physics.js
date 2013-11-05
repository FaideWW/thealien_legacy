/**
 * alien.systems.PhysicsSystem
 *
 * properties
 * ~ gravity : alien.Math.Vector - simulated acceleration due to gravity
 * ~ update_freq : Number - period between updates, in ms
 * ~ time_since_last_update - time elapsed since last update, in ms
 * 
 * methods
 * ~ PhysicsSystem.update  ( dt : Number, g : alien.Game )
 *     - on the timestep interval, performs physics updates on all entities
 *       in the current scene, then performs collision detection on the scene.
 *
 * ~ PhysicsSystem.doCollision ( s : alien.Scene )
 *     - tests the collision of all objects against each other.  If two objects
 *       are colliding, send a 'collide' event to both entities with the following
 *       data:
 *       collision : alien.Math.Vector - the penetration axis and depth returned by 
 *                                       alien.systems.CollisionSystem.  This data
 *                                       is mirrored for the second entity.
 *       entity : alien.Entity         - the other Entity involved in the collision.
 *
 * ~ PhysicsSystem.testCollision ( e1 : alien.Entity, e2 : alien.Entity )
 *     - returns the result of a collision check among two alien.Entity objects.
 *       This is a wrapper function for alien.systems.CollisionSystem.collide()
 *
 * ~ PhysicsSystem.testGroundCollision ( e1 : alien.Entity, s : alien.Scene )
 *     - Tests whether or not an entity is currently positioned on top of another
 *       alien.Entity in the scene.
 *
 * PhysicsSystem represents the simulation of Newtonian physics on the world.  
 *  This includes velocty, acceleration and collision, but does not include 
 *  momentum, elasticity or discrete mass (objects can either have a mass or have
 *  no mass).
 *
 * PhysicsSystem attaches the following to the Entity prototype:
 * alien.Entity.prototype.physicsUpdate( dt : Number )
 *     - performs arithmetic updates to position, velocity and acceleration
 *       (position += velocity, velocity += acceleration, acceleration += gravity^)
 *     - also checks if the Entity is on the ground and whether or not it should
 *       be affected by gravity.
 *     ^ This operation is only performed if: 
 *         - the Entity has mass
 *         - the Entity is not currently on the ground (Entity.on_ground)
 *
 * Attached to Entity.default_properties are the following:
 * - velocity : alien.Math.Vector - change in position in pixels per second
 * - acceleration : alien.Math.Vector - change in velocity in pixels per second
 * - massless : Boolean - whether or not the Entity is affected by gravity
 * - on_ground : Boolean - whether or not the Entity has an object directly 
 *                         beneath it preventing further positive y movement
 * - staticObject : Boolean - whether or not the Entity is part of the static level 
 *                            geometry
 *
 * todo
 * - discrete mass values
 * - variable gravity
 * - friction (maybe)
 * - momentum preservation
 * 
 */

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

                for (var i = 0; i < g.scene.entities.length; i += 1) {
                    if (g.scene.entities[i].on_ground) {
                        //check if still on ground

                        // debugger;
                        g.scene.entities[i].position.y += 1;
                        if (!this.testGroundCollision(g.scene.entities[i], g.scene)) {
                            g.scene.entities[i].on_ground = false;
                        }
                        g.scene.entities[i].position.y -= 1;
                    }
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
        },
        testGroundCollision: function(e1, s) {
            for (var i = 0; i < s.entities.length; i += 1) {
                if (s.entities[i] === e1) {
                    continue;
                }
                var c = this.testCollision(e1, s.entities[i]);
                if (c !== 0 && c.y > 0) {
                    return true;
                }
            }
            return false;
        }
    }

    alien.Entity.default_properties.velocity = new alien.Math.Vector();
    alien.Entity.default_properties.acceleration = new alien.Math.Vector();
    alien.Entity.default_properties.massless = true;
    alien.Entity.default_properties.on_ground = false;
    alien.Entity.default_properties.staticObject = false;

    alien.Entity.prototype.physicsUpdate = function(dt) {

        this.position = this.position.add(this.velocity.mul(dt / 1000));
        this.velocity = this.velocity.add(this.acceleration.mul(dt / 1000));

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