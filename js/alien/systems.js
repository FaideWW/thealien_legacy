/**
 * Created by faide on 2014-09-05.
 */

define([], function () {
    var RenderSystem = (function () {
            var _flags         = null,
                lock           = 0,
                render_target  = null,
                drawRect;

            drawRect = function (entity) {
                var position    = entity.components[_flags.position],
                    renderable  = entity.components[_flags.renderable],
                    translation = entity.components[_flags.translation],
                    world_pos;
                if (render_target) {

                    world_pos = {
                        x: position.x + ((translation) ? translation.x : 0),
                        y: position.y + ((translation) ? translation.y : 0)
                    };

                    if (_flags.rotation && entity.components[_flags.rotation]) {
                        render_target.translate(world_pos.x, world_pos.y);
                        render_target.rotate(entity.components[_flags.rotation].angle);
                        render_target.translate(-(world_pos.x), -(world_pos.y));
                    }

                    render_target.translate(world_pos.x, world_pos.y);


                    render_target.fillStyle   = renderable.fill;
                    render_target.strokeStyle = renderable.stroke;


                    render_target.beginPath();
                    render_target.rect(-renderable.half_width, -renderable.half_height,
                            renderable.half_width * 2,  renderable.half_height * 2);
                    render_target.fill();
                    render_target.stroke();
                }
            };


            return {
                init: function (scene, flags) {
                    // store a local copy of flags
                    _flags = flags;
                    if (_flags.renderable && _flags.position) {
                        // required components
                        lock |= _flags.renderable;
                        lock |= _flags.position;

                        // optional components:
                        // rotation
                        // translation
                    } else {
                        console.error("Required components are not registered");
                    }
                    if (!scene.renderTarget) {
                        console.error('Scene has no render target');
                    } else {
                        render_target = scene.renderTarget;
                    }
                },
                step: function (scene) {

                    if (render_target) {
                        render_target.clearRect(0, 0, render_target.canvas.width, render_target.canvas.height);
                    }

                    scene.each(function (entity) {
                        //draw this

                        render_target.save();
                        if (entity.components[_flags.renderable].type === "square") {
                            drawRect(entity);
                        }
                        render_target.restore();

                    }, lock, this);
                }

            }
        }()),
        OrbitSystem = (function () {
            var lock            = 0,
                _flags          = null,
                period          = 1000,
                current_time    = 0;
            return {
                init: function (scene, flags) {
                    _flags = flags;
                    if (_flags.translation && _flags.rotation && _flags.orbital) {
                        lock |= _flags.translation;
                        lock |= _flags.rotation;
                        lock |= _flags.orbital;
                    } else {
                        console.error("Required components are not registered");
                    }
                },
                step: function (scene, dt) {
                    var interpolation, rotation, translation, orbital;

                    scene.each(function (entity) {
                        rotation    = entity.components[_flags.rotation];
                        translation = entity.components[_flags.translation];
                        orbital     = entity.components[_flags.orbital];

                        current_time = (current_time + dt) % period;
                        interpolation = current_time / period;

                        rotation.angle = (Math.PI * 2) * interpolation;

                        translation.x = Math.cos(rotation.angle) * orbital.radius;
                        translation.y = Math.sin(rotation.angle) * orbital.radius;

                        // for testing bounds-checking; will remove when OBBs are implemented
                        rotation.angle = 0;

                    }, lock, this);

                }
            }
        }()),
        PhysicsSystem = (function () {
            var _flags = null,
                lock = 0;

            return {
                init: function (scene, flags) {
                    _flags = flags;
                    if (_flags.position && _flags.velocity) {
                        lock |= _flags.position;
                        lock |= _flags.velocity;
                    } else {
                        console.error('Required components not registered');
                    }
                },
                step: function (scene, dt) {
                    scene.each(function (entity) {
                        var position = entity.components[_flags.position],
                            velocity = entity.components[_flags.velocity];
                        position.x += velocity.x * (dt / 1000);
                        position.y += velocity.y * (dt / 1000);
                    }, lock, this);
                }
            }
        }()),
        ControlSystem = (function () {
            var _flags = null,
                lock   = 0;

            return {
                init: function (scene, flags) {
                    _flags = flags;
                    console.log(flags);
                    if (_flags.controller && _flags.position && _flags.velocity) {
                        lock |= flags.controller;
                        lock |= flags.position;
                        lock |= flags.velocity;
                    } else {
                        console.error('Required components not registered');
                    }
                },
                step: function (scene, dt) {
                    scene.each(function (entity) {
                        var controller = entity.components[_flags.controller],
                            position   = entity.components[_flags.position],
                            velocity   = entity.components[_flags.velocity],
                            mouse      = {
                                x: scene.input.mouseX,
                                y: scene.input.mouseY
                            };
                        switch (controller.type) {
                            case "paddle":
                                velocity.y = (mouse.y - position.y) / (dt / 1000);
                                break;
                            case "mouse":
                                velocity.x = (mouse.x - position.x) / (dt / 1000);
                                velocity.y = (mouse.y - position.y) / (dt / 1000);
                                break;
                            default:
                                break;
                        }
                    }, lock, this);
                }
            }
        }()),
        CollisionSystem = (function () {
            var _flags = null,
                lock   = 0,
                scene_width = 0,
                scene_height = 0,

                betterAABBTest = function (pos1, pos2, aabb1, aabb2, vel1, vel2) {
                    var aabb_sum = {
                        half_width: aabb1.half_width + aabb2.half_width,
                        half_height: aabb1.half_height + aabb2.half_height
                    },
                        relative_pos = {
                            x: pos2.x - pos1.x,
                            y: pos2.y - pos1.y
                        };


                },

                aabbTest = function (pos1, pos2, aabb1, aabb2) {
                    var aabb_sum = {
                            half_width:  aabb1.half_width  + aabb2.half_width,
                            half_height: aabb1.half_height + aabb2.half_height
                        },
                        relative_pos = {
                            x: pos2.x - pos1.x,
                            y: pos2.y - pos1.y
                        },
                        collisionExists = (
                            (relative_pos.x < aabb_sum.half_width  && relative_pos.x > -aabb_sum.half_width) &&
                            (relative_pos.y < aabb_sum.half_height && relative_pos.y > -aabb_sum.half_height)
                            ),
                        isXCollision = (aabb_sum.half_width - Math.abs(relative_pos.x) < aabb_sum.half_height - Math.abs(relative_pos.y));

                    return {
                        x: collisionExists && isXCollision,
                        y: collisionExists && !isXCollision
                    };

                },
                boundaryTest = function (pos, aabb, vel) {
                    var minX = aabb.half_width,
                        minY = aabb.half_height,
                        maxX = scene_width - aabb.half_width,
                        maxY = scene_height - aabb.half_height;

                    return {
                        x: ((pos.x < minX || pos.x > maxX)),
                        y: (pos.y < minY || pos.y > maxY)
                    }
                };
            return {
                init: function (scene, flags) {
                    _flags = flags;
                    if (_flags.position && _flags.collidable && _flags.velocity) {
                        lock |= _flags.position;
                        lock |= _flags.collidable;
                        lock |= _flags.velocity;
                    } else {
                        console.error('Required components not registered');
                    }

                    if (scene.renderTarget) {
                        scene_width  = scene.renderTarget.canvas.width;
                        scene_height = scene.renderTarget.canvas.height;
                    }
                },
                step: function (scene) {
                    scene.pairs(function (entity1, entity2) {
                        var position1 = entity1.components[_flags.position],
                            position2 = entity2.components[_flags.position],
                            collidable1 = entity1.components[_flags.collidable],
                            collidable2 = entity2.components[_flags.collidable],
                            velocity1   = entity1.components[_flags.velocity],
                            velocity2   = entity2.components[_flags.velocity],
                            oob1 = boundaryTest(position1, collidable1),
                            oob2 = boundaryTest(position2, collidable2),
                            aabb_test_result = aabbTest(position1, position2, collidable1, collidable2);

                        if (collidable1.type === "aabb" && collidable2.type === "aabb") {
                            if (oob1.x) {
                                collidable1.collidedX = true;
                            }
                            if (oob1.y) {
                                collidable1.collidedY = true;
                            }

                            if (oob2.x) {
                                collidable2.collidedX = true;
                            }
                            if (oob2.y) {
                                collidable2.collidedY = true;
                            }

                            if (aabb_test_result.x || aabb_test_result.y) {
                                // handle collision
                                console.log('collision');
                                if (aabb_test_result.x) {
                                    collidable1.collidedX = true;
                                    collidable2.collidedX = true;
                                }
                                if (aabb_test_result.y) {
                                    collidable1.collidedY = true;
                                    collidable2.collidedY = true;
                                }

                                if (_flags.controller) {
                                    if (entity1.components[_flags.controller]) {
                                        collidable2.collision_data.velocity = velocity1;
                                    }
                                    if (entity2.components[_flags.controller]) {
                                        collidable1.collision_data.velocity = velocity2;

                                    }
                                }
                            }
                        }
                    }, lock, this);
                }
            }
        }()),
        BounceSystem = (function () {
            var _flags = null,
                lock   = 0;

            return {
                init: function (scene, flags) {
                    _flags = flags;
                    if (_flags.collidable && _flags.velocity) {
                        lock |= _flags.collidable;
                        lock |= _flags.velocity;
                    } else {
                        console.error('Required components not registered');
                    }
                },
                step: function (scene) {
                    scene.each(function (entity) {
                        var collidable = entity.components[_flags.collidable],
                            velocity   = entity.components[_flags.velocity];

                        if ((collidable.collidedX || collidable.collidedY) && collidable.reaction === "bounce") {
                            if (collidable.collidedX) {
                                velocity.x *= -1;
                                collidable.collidedX = false;
                            }

                            if (collidable.collidedY) {
                                velocity.y *= -1;
                                collidable.collidedY = false;
                            }
                        }
                    }, lock, this);
                }
            };
        }()),
        ImpulseSystem = (function () {
            var _flags = null,
                lock   = 0;

            return {
                init: function (scene, flags) {
                    _flags = flags;
                    if (_flags.collidable && _flags.velocity) {
                        lock |= _flags.collidable;
                        lock |= _flags.velocity;
                    } else {
                        console.error('Required components not registered');
                    }
                },
                step: function (scene) {
                    scene.each(function (entity) {
                        var collidable = entity.components[_flags.collidable],
                            velocity   = entity.components[_flags.velocity];


                        if ((collidable.collidedX || collidable.collidedY) && collidable.collision_data.velocity) {
                            console.log('impulse');
                            velocity.x += collidable.collision_data.velocity.x;
                            velocity.y += collidable.collision_data.velocity.y;
                        }
                    }, lock, this);
                }
            };
        }());

    return {
        render_system:    RenderSystem,
        orbit_system:     OrbitSystem,
        physics_system:   PhysicsSystem,
        control_system:   ControlSystem,
        collision_system: CollisionSystem,
        bounce_system:    BounceSystem,
        impulse_system:   ImpulseSystem
    };
});