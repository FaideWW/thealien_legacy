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
                rotation    = entity.components[_flags.rotation],
                translation = entity.components[_flags.translation],
                world_pos;
            if (render_target) {

                world_pos = {
                    x: position.x + ((translation) ? translation.x : 0),
                    y: position.y + ((translation) ? translation.y : 0)
                };

                if (_flags.rotation && rotation) {
                    render_target.translate(world_pos.x, world_pos.y);
                    render_target.rotate(rotation.angle);
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
        BoundarySystem = (function () {
            var _flags = null,
                lock   = 0,
                canvas_width = 0,
                canvas_height = 0;
            return {
                init: function (scene, flags) {
                    _flags = flags;
                    if (_flags.collidable && _flags.position) {
                        lock |= _flags.collidable;
                        lock |= _flags.position;
                    } else {
                        console.error('Required components are not registered');
                    }

                    if (scene.renderTarget) {
                        canvas_width  = scene.renderTarget.canvas.width;
                        canvas_height = scene.renderTarget.canvas.height;
                    } else {
                        console.error('No render target specified; cannot check bounds');
                    }
                },
                step: function (scene) {
                    scene.each(function (entity) {
                        var collidable = entity.components[_flags.collidable],
                            position   = entity.components[_flags.position],
                            world_pos = position,
                            minX = collidable.half_width,
                            minY = collidable.half_height,
                            maxX = canvas_width  - minX,
                            maxY = canvas_height - minY;

                        if (_flags.translation) {
                            // break the reference
                            world_pos = {
                                x: position.x + entity.components[_flags.translation].x,
                                y: position.y + entity.components[_flags.translation].y,
                            };
                        }

                        if (world_pos.x < minX || world_pos.x > maxX) {
                            console.log('out of bounds: X', world_pos.x);
                            if (_flags.velocity) {
                                entity.components[_flags.velocity].x *= -1;
                            }
                            position.x = (world_pos.x < minX) ? minX : maxX;
                        }

                        if (world_pos.y < minY || world_pos.y > maxY) {
                            console.log('out of bounds: Y', world_pos.y);
                            if (_flags.velocity) {
                                entity.components[_flags.velocity].y *= -1;
                            }
                            position.y = (world_pos.y < minY) ? minY : maxY;
                        }

                        console.groupEnd();
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
                    if (_flags.controller && _flags.position) {
                        lock |= flags.controller;
                        lock |= flags.position;
                    } else {
                        console.error('Required components not registered');
                    }
                },
                step: function (scene, dt) {
                    scene.each(function (entity) {
                        var controller = entity.components[_flags.controller],
                            position   = entity.components[_flags.position],
                            mouse      = {
                                x: scene.input.mouseX,
                                y: scene.input.mouseY
                            };
                        if (controller.type === "paddle") {
                            position.y = mouse.y;
                        }
                    }, lock, this);
                }
            }
        }());

    return {
        render_system: RenderSystem,
        orbit_system:  OrbitSystem,
        boundary_system: BoundarySystem,
        physics_system: PhysicsSystem,
        control_system: ControlSystem
    };
});