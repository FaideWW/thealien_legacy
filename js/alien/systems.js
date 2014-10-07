/**
 * Created by faide on 2014-09-05.
 */

// TODO: resolve bullet-through-paper effect at high ball velocities


'use strict';

define([], function () {
    var RenderSystem = (function () {
            var _flags         = null,
                lock           = 0,
                render_target  = null,
                drawRect, drawText;

            drawRect = function (entity) {

                var position     = entity.components[_flags.position],
                    renderable   = entity.components[_flags.renderable],
                    translation  = entity.components[_flags.translation],
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

            drawText = function (entity) {
                var position     = entity.components[_flags.position],
                    renderable   = entity.components[_flags.renderable],
                    translation  = entity.components[_flags.translation],
                    align_offset = 0,
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


                    render_target.font = renderable.font;

                    if (renderable.align && renderable.align === "center") {
                        align_offset = render_target.measureText(renderable.text).width / 2;
                    }

                    world_pos.x -= align_offset;

                    render_target.translate(world_pos.x, world_pos.y);


                    if (renderable.fill) {
                        render_target.fillStyle   = renderable.fill;
                        render_target.fillText(renderable.text, 0, 0);
                    }

                    if (renderable.stroke) {
                        render_target.strokeStyle = renderable.stroke;
                        render_target.strokeText(renderable.text, 0, 0);
                    }

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
                        throw new Error('Required components not registered');
                    }
                    if (!scene.renderTarget) {
                        throw new Error('Scene has no render target')
                    } else {
                        render_target = scene.renderTarget;
                    }
                },
                step: function (scene) {

                    if (render_target) {
                        render_target.clearRect(0, 0, render_target.canvas.width, render_target.canvas.height);
                        render_target.fillStyle = "rgba(0,0,0,1)";
                        render_target.fillRect( 0, 0, render_target.canvas.width, render_target.canvas.height);
                        scene.each(function (entity) {
                            //draw this

                            render_target.save();
                            switch (entity.components[_flags.renderable].type) {
                                case "rect":
                                    drawRect(entity);
                                    break;
                                case "text":
                                    drawText(entity);
                                    break;
                                default:
                                    break;
                            }
                            render_target.restore();

                        }, lock, this);
                    }

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
                        throw new Error('Required components not registered');
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
                        throw new Error('Required components not registered');
                    }
                },
                step: function (scene, dt) {
                    // digest messages
                    scene.msg.resolve('physics', this);

                    // process entities
                    scene.each(function (entity) {
                        var position = entity.components[_flags.position],
                            velocity = entity.components[_flags.velocity];

                        if (!(_flags.controller && entity.components[_flags.controller])) {
                            position.x += velocity.x * (dt / 1000);
                            position.y += velocity.y * (dt / 1000);

                            if (_flags.acceleration && entity.components[_flags.acceleration]) {
                                velocity.x += entity.components[_flags.acceleration].x * (dt / 1000);
                                velocity.y += entity.components[_flags.acceleration].y * (dt / 1000);

//                                entity.components[_flags.acceleration].y *= 0.99;
//                                entity.components[_flags.acceleration].x *= 0.99;
                            }

                            if (_flags.spin && entity.components[_flags.spin] &&
                                _flags.rotation && entity.components[_flags.rotation]) {
                                entity.components[_flags.rotation].angle += entity.components[_flags.spin].angular_v * (dt / 1000);
                                // drag
                                entity.components[_flags.spin].angular_v *= 0.99;
                            }
                        }

                    }, lock, this);
                },
                // move an entity by a specified vector
                shift: function (entity, vector) {
                    // if the entity is being controlled, don't shift it
                    if (!(_flags.controller && entity.components[_flags.controller])) {
                        entity.components[_flags.position].x += vector.x;
                        entity.components[_flags.position].y += vector.y;
                    }
                },
                accelerate: function (entity, accel, abs) {
                    if (!(_flags.controller && entity.components[_flags.controller]) &&
                        (_flags.acceleration && entity.components[_flags.acceleration])) {
                        if (abs) {
                            entity.components[_flags.acceleration].x = 0;
                            entity.components[_flags.acceleration].y = 0;
                        }
                        entity.components[_flags.acceleration].x += accel.x;
                        entity.components[_flags.acceleration].y += accel.y;
                    }
                },
                spin: function (entity, angular_v, dir) {
                    if (!(_flags.controller && entity.components[_flags.controller]) &&
                        (_flags.spin && entity.components[_flags.spin])) {
                        entity.components[_flags.spin].angular_v = (angular_v * dir);
                    }
                }
            }
        }()),
        ControlSystem = (function () {
            var _flags      = null,
                lock        = 0,
                range    = null;

            return {
                init: function (scene, flags) {
                    _flags = flags;
                    console.log(flags);
                    if (_flags.controller && _flags.position && _flags.velocity) {
                        lock |= flags.controller;
                        lock |= flags.position;
                        lock |= flags.velocity;
                    } else {
                        throw new Error('Required components not registered');
                    }

                    // optional render target boundaries
                    if (scene.renderTarget) {
                        range = {
                            x: {
                                min: 50,
                                max: scene.renderTarget.canvas.width - 50
                            },
                            y: {
                                min: 50,
                                max: scene.renderTarget.canvas.height - 50
                            }
                        };
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
                            },
                            adjusted_range = null,
                            last_pos = {
                                x: position.x,
                                y: position.y
                            };



                        if (range) {

                            if (_flags.renderable && entity.components[_flags.renderable]) {
                                adjusted_range = {
                                    x: {
                                        min: range.x.min + entity.components[_flags.renderable].half_width,
                                        max: range.x.max - entity.components[_flags.renderable].half_width
                                    },
                                    y: {
                                        min: range.y.min + entity.components[_flags.renderable].half_height,
                                        max: range.y.max - entity.components[_flags.renderable].half_height
                                    }
                                };
                            }

                            // clamp the paddles to within the defined boundaries
                            position[controller.direction] = Math.max(
                                Math.min(
                                    adjusted_range[controller.direction].max,
                                    mouse[controller.direction]),
                                adjusted_range[controller.direction].min
                            );
                        } else {
                            position[controller.direction] = mouse[controller.direction];
                        }

                        velocity.x = (position.x - last_pos.x);
                        velocity.y = (position.y - last_pos.y);

                    }, lock, this);
                }
            }
        }()),
        CollisionDetectionSystem = (function () {

            // TODO: project ball trajectory to determine speculative collisions with paddles at high velocity

            var _flags = null,
                lock   = 0,
                scene_width = 0,
                scene_height = 0,
                spin_scalar  = 10,

                // returns a collision manifold from the perspective of collidable1
                AABBTest = function (pos1, pos2, aabb1, aabb2) {
                    var aabb_sum = {
                            half_width: aabb1.half_width + aabb2.half_width,
                            half_height: aabb1.half_height + aabb2.half_height
                        },
                        relative_pos = {
                            x: pos2.x - pos1.x,
                            y: pos2.y - pos1.y
                        },
                        collision_manifold = {};

                    // find closest point and return the difference to it
                    if (relative_pos.x < 0) {
                        collision_manifold.x = aabb_sum.half_width + relative_pos.x;
                    } else {
                        collision_manifold.x = aabb_sum.half_width - relative_pos.x;
                    }

                    if (relative_pos.y < 0) {
                        collision_manifold.y = aabb_sum.half_height + relative_pos.y;
                    } else {
                        collision_manifold.y = aabb_sum.half_height - relative_pos.y;
                    }

                    return collision_manifold;

                },
                doShift = function (scene, e, v) {
                    scene.msg.enqueue('physics', function () {
                        this.shift(e, v);
                    })
                },
                applySpin = function (scene, e, v, dir) {
                    scene.msg.enqueue('physics', function () {
                        var spin_v = (v.x + v.y) * spin_scalar;
                        this.accelerate(e, {
                            x: v.x * spin_scalar,
                            y: v.y * spin_scalar
                        }, true);
                        this.spin(e, spin_v, dir)
                    })
                };
            return {
                init: function (scene, flags) {
                    _flags = flags;
                    if (_flags.position && _flags.collidable) {
                        lock |= _flags.position;
                        lock |= _flags.collidable;
                    } else {
                        throw new Error('Required components not registered');
                    }

                    if (scene.renderTarget) {
                        scene_width  = scene.renderTarget.canvas.width;
                        scene_height = scene.renderTarget.canvas.height;
                    }
                },
                step: function (scene) {
                    scene.pairs(function (entity1, entity2) {
                        var position1 =          entity1.components[_flags.position],
                            position2 =          entity2.components[_flags.position],
                            collidable1 =        entity1.components[_flags.collidable],
                            collidable2 =        entity2.components[_flags.collidable],
                            collision_manifold;


                        if (collidable1.type === "aabb" && collidable2.type === "aabb") {
                            collision_manifold = AABBTest(position1, position2, collidable1, collidable2);

                            if (collision_manifold.x > 0 && collision_manifold.y > 0) {
                                if (collision_manifold.x < collision_manifold.y) {
                                    if (position1.x < position2.x) {
                                        collidable1.manifold = { x: -1, y: 0 };
                                        collidable2.manifold = { x: 1, y: 0  };
                                        // position1 shifts left, position2 shifts right
                                        doShift(scene, entity1, { x: -collision_manifold.x, y: 0 });
                                        doShift(scene, entity2, { x: collision_manifold.x, y: 0 });

                                        if (_flags.velocity && entity1.components[_flags.velocity] && entity2.components[_flags.velocity]) {
                                            applySpin(scene, entity1, {
                                                x: -entity2.components[_flags.velocity].x,
                                                y: -entity2.components[_flags.velocity].y
                                            }, -1);
                                            applySpin(scene, entity2, {
                                                x: -entity1.components[_flags.velocity].x,
                                                y: -entity1.components[_flags.velocity].y
                                            }, 1);

                                        }




                                        collidable1.collidedX = true;
                                        collidable2.collidedX = true;
                                    } else {
                                        collidable1.manifold = { x: 1, y: 0  };
                                        collidable2.manifold = { x: -1, y: 0 };
                                        // position1 shifts right, position2 shifts left
                                        doShift(scene, entity1, { x: collision_manifold.x, y: 0 });
                                        doShift(scene, entity2, { x: -collision_manifold.x, y: 0 });

                                        if (_flags.velocity && entity1.components[_flags.velocity] && entity2.components[_flags.velocity]) {
                                            applySpin(scene, entity1, {
                                                x: -entity2.components[_flags.velocity].x,
                                                y: -entity2.components[_flags.velocity].y
                                            }, 1);
                                            applySpin(scene, entity2, {
                                                x: -entity1.components[_flags.velocity].x,
                                                y: -entity1.components[_flags.velocity].y
                                            }, -1);

                                        }

                                        collidable1.collidedX = true;
                                        collidable2.collidedX = true;
                                    }
                                } else {
                                    if (position1.y < position2.y) {
                                        collidable1.manifold = { x: 0, y: -1 };
                                        collidable2.manifold = { x: 0, y: 1  };
                                        // position1 shifts up, position2 shifts down
                                        doShift(scene, entity1, { x: 0, y: -collision_manifold.y });
                                        doShift(scene, entity2, { x: 0, y: collision_manifold.y });

                                        if (_flags.velocity && entity1.components[_flags.velocity] && entity2.components[_flags.velocity]) {
                                            applySpin(scene, entity1, {
                                                x: -entity2.components[_flags.velocity].x,
                                                y: -entity2.components[_flags.velocity].y
                                            }, 1);
                                            applySpin(scene, entity2, {
                                                x: -entity1.components[_flags.velocity].x,
                                                y: -entity1.components[_flags.velocity].y
                                            }, -1);

                                        }

                                        collidable1.collidedY = true;
                                        collidable2.collidedY = true;
                                    } else {
                                        collidable1.manifold = { x: 0, y: 1  };
                                        collidable2.manifold = { x: 0, y: -1 };
                                        // position1 shifts down, position2 shifts up
                                        doShift(scene, entity1, { x: 0, y: collision_manifold.y });
                                        doShift(scene, entity2, { x: 0, y: -collision_manifold.y });

                                        if (_flags.velocity && entity1.components[_flags.velocity] && entity2.components[_flags.velocity]) {
                                            applySpin(scene, entity1, {
                                                x: -entity2.components[_flags.velocity].x,
                                                y: -entity2.components[_flags.velocity].y
                                            }, -1);
                                            applySpin(scene, entity2, {
                                                x: -entity1.components[_flags.velocity].x,
                                                y: -entity1.components[_flags.velocity].y
                                            }, 1);

                                        }

                                        collidable1.collidedY = true;
                                        collidable2.collidedY = true;
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
                lock   = 0,

                dot = function (v1, v2) {
                    return v1.x * v2.x + v1.y * v2.y;
                },
                unit = function (v) {
                    var mag = Math.sqrt(v.x * v.x + v.y * v.y);
                    return {
                        x: v.x / mag,
                        y: v.y / mag
                    };
                };

            return {
                init: function (scene, flags) {
                    _flags = flags;
                    if (_flags.collidable && _flags.velocity) {
                        lock |= _flags.collidable;
                        lock |= _flags.velocity;
                    } else {
                        throw new Error('Required components not registered');
                    }
                },
                step: function (scene) {
                    scene.each(function (entity) {
                        var collidable = entity.components[_flags.collidable],
                            velocity   = entity.components[_flags.velocity];

                        if ((collidable.collidedX || collidable.collidedY) && collidable.reaction === "bounce") {
                            if (dot(collidable.manifold, unit(velocity)) < 0) {
                                // ensure the collision has not already been resolved (i.e. the velocity is moving the entity in the opposite direction of the manifold)
                                if (collidable.collidedX) {
                                    velocity.x *= -1.1;
                                    collidable.collidedX = false;
                                }

                                if (collidable.collidedY) {
                                    // determine if the collision is already being resolved
                                    velocity.y *= -1.1;
                                    collidable.collidedY = false;
                                }

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
                        throw new Error('Required components not registered');
                    }
                },
                step: function (scene) {
                    scene.each(function (entity) {
                        var collidable = entity.components[_flags.collidable],
                            velocity   = entity.components[_flags.velocity];


                        if ((collidable.collidedX || collidable.collidedY) && collidable.collision_data.velocity) {
                            velocity.x += collidable.collision_data.velocity.x;
                            velocity.y += collidable.collision_data.velocity.y;
                        }
                    }, lock, this);
                }
            };
        }()),
        PongBoundarySystem = (function () {
            var _flags = null,
                lock   = 0,
                scene_height = 0,
                scene_width  = 0;

            return {
                init: function (scene, flags) {
                    _flags = flags;
                    if (_flags.collidable && _flags.velocity && _flags.position && _flags.type) {
                        lock |= _flags.collidable;
                        lock |= _flags.velocity;
                        lock |= _flags.position;
                        lock |= _flags.type;
                    } else {
                        throw new Error('Required components not registered');
                    }

                    if (scene.renderTarget) {
                        scene_height = scene.renderTarget.canvas.height;
                        scene_width  = scene.renderTarget.canvas.width;
                    } else {
                        throw new Error('Scene has no render target');
                    }
                },
                step: function (scene, dt) {
                    scene.each(function (entity) {
                        var collidable = entity.components[_flags.collidable],
                            velocity   = entity.components[_flags.velocity],
                            position   = entity.components[_flags.position],
                            type       = entity.components[_flags.type],

                            minY       =                collidable.half_height,
                            maxY       = scene_height - collidable.half_height,
                            minX       =                collidable.half_width,
                            maxX       = scene_width  - collidable.half_width,
                            new_angle  = 0;

                        if (type.type === "ball") {

                            if (position.x < minX || position.x > maxX || position.y < minY || position.y > maxY) {
                                // reset score
                                scene.gameState.points = 0;
                                entity.reset();
                                console.log('resetting');
                                new_angle = Math.random() * Math.PI * 2;
                                velocity.x = Math.cos(new_angle) * scene.gameState.INITIAL_BALL_VELOCITY;
                                velocity.y = Math.sin(new_angle) * scene.gameState.INITIAL_BALL_VELOCITY;
                            } else {
                                scene.gameState.points += dt;

                            }
                        }

                    }, lock, this);
                }
            }
        }()),
        StartMenuSystem = (function () {
            var _flags = null,
                lock   = 0;
            return {
                init: function (scene, flags) {
                    _flags = flags;
                    if (_flags.renderable && _flags.position && _flags.listener && _flags.collidable) {
                        lock |= _flags.renderable;
                        lock |= _flags.position;
                        lock |= _flags.listener;
                        lock |= _flags.collidable;
                    } else {
                        throw new Error('Required components not registered');
                    }
                },
                step: function (scene) {
                    // poll input
                    scene.each(function () {
                        if (scene.input.mouse) {
                            console.log('go next');
                            scene.goTo("scene1");
                        }
                    }, lock)
                }
            }
        }());

    return {
        render_system:                RenderSystem,
        orbit_system:                 OrbitSystem,
        physics_system:               PhysicsSystem,
        control_system:               ControlSystem,
        collision_system:             CollisionDetectionSystem,
        bounce_system:                BounceSystem,
        impulse_system:               ImpulseSystem,
        pong_boundary_system:         PongBoundarySystem,
        start_menu_system:            StartMenuSystem
    };
});