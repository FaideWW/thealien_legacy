/**
 * Created by faide on 2014-04-23.
 */

define(['underscore', 'alien/utilities/math', 'alien/logging', 'alien/systems/event',
        'alien/systems/messaging'], function (_, M, Log, Event, Messaging) {
    "use strict";
    var PhysicsSystem = (function () {
        var MAX_V               = 240,
            gravity             = new M.Vector({x: 0, y: 400}),
            air_friction        = 0.95,
            ground_friction     = 0.5,
            initGravityEntities = function (scene) {
                var entities = scene.getAllWithAllOf(['collidable', 'movable']);
                _.each(entities, function (entity) {
                    Event.on(entity, 'collide', function (manifold) {
                        if (manifold.other.isStatic
                                // 45 degree angle is the maximum
                                && (0.5 > 1 - manifold.manifold.unt().dot(M.directions.NORTH))
                                //if the entity is moving into the "ground"
                                && 0.001 >= manifold.manifold.unt().dot(this.movable.velocity.unt())) {
                            PhysicsSystem.ground(this);
                            this.movable.jumping = false;
                            console.log('is on ground');
                        } else {
                            console.group('colliding, but not with ground');
                            console.log('manifold', manifold.manifold.unt());
                            console.log('velocity', this.movable.velocity.unt());
                            console.log('dot', manifold.manifold.unt().dot(this.movable.velocity.unt()));
                            console.groupEnd();
                        }
                    });
                });
            };

        return {
            id: "__PHYSICS",
            MAX_V: MAX_V,
            init: function (scene) {
                initGravityEntities(scene);
            },
            interpolatedVector: function (v, dt) {
                return M.lerp(0, v, dt / 1000);
            },
            interpolatedScalar: function (s, dt) {
                return s * dt / 1000;
            },
            uninterpolatedVector: function (v, dt) {
                return v.mul(1000 / dt);
            },
            step: function (scene, dt) {
                /* Fetch messages */
                var entities = scene.getAllWithAllOf(['movable', 'position']);
                Messaging.fetch('physics');
                _.each(entities, function (e) {
                    var m = e.movable;
                    if (0 !== m.velocity.y) {
                        m.onGround = false;
                    }

                    if (e.camera) {
                        e.camera.position = this.performCameraDynamics(e, dt);
                    }

                    m.velocity = m.velocity.add(this.interpolatedVector(m.acceleration, dt));
                    if (m.hasGravity) {
                        m.velocity = m.velocity.add(this.interpolatedVector(gravity, dt));
                    }
                    /* Resolve position first, then velocity */
                    e.position = e.position.add(this.interpolatedVector(m.velocity, dt));

                    if (m.onGround) {
                        if (1 > Math.abs(m.velocity.x)) {
                            m.velocity.x = 0;
                        }
                        if (!(m.movingRight || m.movingLeft)) {
                            m.velocity = m.velocity.mul(ground_friction);
                        }
                    } else {
                        if (1 > Math.abs(m.velocity.x)) {
                            m.velocity.x = 0;
                        }
                        if (!(m.movingRight || m.movingLeft)) {
                            m.velocity.x *= air_friction;
                        }
                    }

                    /* Clamp velocity to MAX_V on each axis*/
                    m.velocity.x = M.clamp(m.velocity.x, -MAX_V, MAX_V);
                    m.velocity.y = M.clamp(m.velocity.y, -MAX_V, MAX_V);


                    /* Camera dynamics */

                }, this);
            },
            performCameraDynamics: function (e, dt) {
                var m = e.movable,
                    cam_to_entity,
                    interpolation_factor;
                if (!e.camera.position) {
                    return e.position;
                }
                if (!e.camera.position.eq(e.position)) {
                    /*
                        Camera should
                     */
                    cam_to_entity = e.position.sub(e.camera.position);
                    interpolation_factor = M.clamp(cam_to_entity.mag() / e.camera.lerpzone_radius, 0, 1);

                    // normalize to use as a direction vector
                    cam_to_entity = cam_to_entity.unt();
                    return e.camera.position.add(cam_to_entity.mul(this.interpolatedScalar(MAX_V, dt) * interpolation_factor));
                    //Log.toConsole(1 - ((e.camera.lerpzone_radius - e.position.sub(e.camera.position).mag()) / e.camera.lerpzone_radius));
                    //Log.toConsole(e.camera.position);
                }
            },
            ground: function (entity) {
                if (entity.movable) {
                    entity.movable.onGround = true;
                    entity.movable.velocity.y = 0;
                    entity.movable.jump = 0;
                }
            },
            resolveCollision: function () {
                Messaging.fetch('collisionresolution');
            },
            impulse: function (entity, vector) {
                if (entity.movable) {
                    entity.movable.velocity = entity.movable.velocity.add(vector);
                }
            },
            shift: function (entity, vector) {
                if (entity.position) {
                    entity.position = entity.position.add(vector);
                }
            },
            flatten: function (entity, normal) {
                if (entity.movable) {
                    entity.movable.velocity = entity.movable.velocity.sub(entity.movable.velocity.vectorProject(normal));
                }
            },
            bounce: function (entity, normal) {
                if (entity.movable) {
                    entity.movable.velocity = entity.movable.velocity.normalReflect(normal);
                }
            }
        };
    }());
    return PhysicsSystem;
});