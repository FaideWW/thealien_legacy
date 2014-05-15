/**
 * Created by faide on 2014-04-23.
 */

define(['underscore', 'alien/utilities/math', 'alien/logging', 'alien/systems/event',
        'alien/systems/messaging'], function (_, M, Log, Event, Messaging) {
    "use strict";
    var PhysicsSystem = (function () {
        var MAX_V               = 120,
            gravity             = new M.Vector({x: 0, y: 100}),
            air_friction        = 0.95,
            ground_friction     = 0.5,
            initGravityEntities = function (scene) {
                var entities = scene.getAllWithAllOf(['collidable', 'movable']);
                console.log(entities);
                _.each(entities, function (entity) {
                    Event.on(entity, 'collide', function (manifold) {
                        if (manifold.other.isStatic
                                && (1 - manifold.manifold.unt().dot(new M.Vector({x: 0, y: -1}))) < 0.0001
                                && this.movable.velocity.y >= 0
                                ) {
                            PhysicsSystem.ground(this);
                            this.movable.jumping = false;
                        }
                    });
                });
            };

        return {
            MAX_V: MAX_V,
            init: function (scene) {
                initGravityEntities(scene);
            },
            interpolatedVector: function (v, dt) {
                return v.mul(dt / 1000);
            },
            uninterpolatedVector: function (v, dt) {
                return v.mul(1000 / dt);
            },
            step: function (scene, dt) {
                /* Fetch messages */
                Messaging.fetch('physics');
                var entities = scene.getAllWithAllOf(['movable', 'position']);
                _.each(entities, function (e) {
                    var m = e.movable;
                    if (m.velocity.y !== 0) {
                        m.onGround = false;
                    }
                    if (dt > 1000 && e.id === "player") {
                        console.log(m.velocity);
                        console.log(this.interpolatedVector(m.velocity, dt));
                    }
                    /* Resolve position first, then velocity */
                    e.position = e.position.add(this.interpolatedVector(m.velocity, dt));
                    m.velocity = m.velocity.add(this.interpolatedVector(m.acceleration, dt));
                    if (m.hasGravity) {
                        m.velocity = m.velocity.add(this.interpolatedVector(gravity, dt));
                    }

                    if (m.onGround) {
                        if (Math.abs(m.velocity.x) < 1) {
                            m.velocity.x = 0;
                        }
                        if (!(m.movingRight || m.movingLeft)) {
                            m.velocity = m.velocity.mul(ground_friction);
                        }
                    } else {
                        if (Math.abs(m.velocity.x) < 1) {
                            m.velocity.x = 0;
                        }
                        if (!(m.movingRight || m.movingLeft)) {
                            m.velocity.x *= air_friction;
                        }
                    }

                    /* Clamp velocity to MAX_V on each axis*/
                    m.velocity.x = M.clamp(m.velocity.x, -MAX_V, MAX_V);
                    m.velocity.y = M.clamp(m.velocity.y, -MAX_V, MAX_V);
                }, this);
            },
            ground: function (entity) {
                if (entity.movable) {
                    entity.movable.onGround = true;
                    entity.movable.velocity.y = 0;
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