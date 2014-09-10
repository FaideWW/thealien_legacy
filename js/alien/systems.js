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
                    render_target.clearRect(0, 0, render_target.canvas.half_width, render_target.canvas.height);
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
                radius          = 100,
                current_time    = 0;
            return {
                init: function (scene, flags) {
                    _flags = flags;
                    if (_flags.translation && _flags.rotation) {
                        lock |= _flags.translation;
                        lock |= _flags.rotation;
                    } else {
                        console.error("Required components are not registered");
                    }
                },
                step: function (scene, dt) {
                    var interpolation, rotation, translation;

                    scene.each(function (entity) {
                        rotation = entity.components[_flags.rotation];
                        translation = entity.components[_flags.translation];
                        current_time = (current_time + dt) % period;
                        interpolation = current_time / period;

                        rotation.angle = (Math.PI * 2) * interpolation;

                        translation.x = Math.cos(rotation.angle) * radius;
                        translation.y = Math.sin(rotation.angle) * radius;

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
                        canvas_width  = scene.renderTarget.canvas.half_width;
                        canvas_height = scene.renderTarget.canvas.height;
                    } else {
                        console.error('No render target specified; cannot check bounds');
                    }
                },
                step: function (scene, dt) {
                    scene.each(function (entity) {

                    }, lock, this);
                }
            }
        }());

    return {
        render_system: RenderSystem,
        orbit_system:  OrbitSystem
    };
});