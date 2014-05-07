/**
 * Created by faide on 2014-04-23.
 */

define(['underscore', 'alien/utilities/math', 'alien/logging', 'alien/systems/event',
        'alien/systems/messaging'], function (_, M, Log, Event, Messaging) {
    "use strict";
    var PhysicsSystem = (function () {
        var MAX_V               = 100,
            gravity             = new M.Vector({x: 0, y: 100}),
            air_friction        = 1,
            ground_friction     = 5,
            initGravityEntities = function (scene) {
                var entities = scene.getAllWithAllOf(['collidable', 'movable']);
                console.log(entities);
                _.each(entities, function (entity) {
                    Event.on(entity, 'collide', function (manifold) {
                        if (manifold.other.isStatic && (1 - manifold.manifold.unt().dot(new M.Vector({x: 0, y: -1}))) < 0.0001
                            && this.movable.velocity.y >= 0) {
                            this.movable.onGround = true;
                            this.movable.jumping = false;
                        }
                    });
                });
            };

        return {
            init: function (scene) {
                initGravityEntities(scene);
            },
            step: function (scene, dt) {
                /* Fetch messages */
                Messaging.fetch('physics');
                var entities = scene.getAllWithAllOf(['movable', 'position']);
                _.each(entities, function (e) {
                    var m = e.movable;

                    /* Resolve position first, then velocity */
                    e.position = e.position.add(m.velocity.mul(dt / 1000));
                    m.velocity = m.velocity.add(m.acceleration.mul(dt / 1000));
                    if (e.movable.onGround) {
                        m.velocity.y = 0;
                    } else if (e.movable.hasGravity) {
                        m.velocity = m.velocity.add(gravity.mul(dt / 1000));
                    }

                    /* Clamp velocity to MAX_V on each axis*/
                    m.velocity.x = M.clamp(m.velocity.x, -MAX_V, MAX_V);
                    m.velocity.y = M.clamp(m.velocity.y, -MAX_V, MAX_V);
                });
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
                    entity.movable.velocity.sub(entity.movable.velocity.vectorProject(normal));
                }
            },
            ground: function (entity) {
                if (entity.movable && entity.movable.hasGravity) {
                    entity.movable.onGround = true;
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