/**
 * Created by faide on 2014-04-23.
 */

define(['underscore', 'alien/utilities/math', 'alien/logging', 'alien/systems/event',
        'alien/systems/messaging'], function (_, M, Log, Event, Messaging) {
    "use strict";
    var PhysicsSystem = (function () {
        var MAX_V               = 120,
            gravity             = new M.Vector({x: 0, y: 100}),
            air_friction        = 0.98,
            ground_friction     = 0.9,
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
            step: function (scene, dt) {
                /* Fetch messages */
                Messaging.fetch('physics');
                var entities = scene.getAllWithAllOf(['movable', 'position']);
                _.each(entities, function (e) {
                    var m = e.movable;
                    if (m.velocity.y !== 0) {
                        m.onGround = false;
                    }

                    /* Resolve position first, then velocity */
                    e.position = e.position.add(m.velocity.mul(dt / 1000));
                    m.velocity = m.velocity.add(m.acceleration.mul(dt / 1000));
                    if (m.hasGravity) {
                        m.velocity = m.velocity.add(gravity.mul(dt / 1000));
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
                });
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