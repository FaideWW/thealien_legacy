/**
 * Created by faide on 2014-09-05.
 */

define([], function () {
    var RenderSystem = (function () {
        var lock            = 0,
            renderableFlag  = 0,
            positionFlag    = 0,
            rotationFlag    = 0,
            translationFlag = 0,
            render_target  = null,
            drawRect;

        drawRect = function (entity) {
            var position    = entity.components[positionFlag],
                renderable  = entity.components[renderableFlag],
                rotation    = entity.components[rotationFlag],
                translation = entity.components[translationFlag],
                world_pos;
            if (render_target) {

                world_pos = {
                    x: position.x + ((translation) ? translation.x : 0),
                    y: position.y + ((translation) ? translation.y : 0)
                };

                if (rotationFlag && rotation) {
                    render_target.translate(world_pos.x + renderable.width / 2, world_pos.y + renderable.height / 2);
                    render_target.rotate(rotation.angle);
                    render_target.translate(-(world_pos.x + renderable.width / 2), -(world_pos.y + renderable.height / 2));
                }

                render_target.translate(world_pos.x, world_pos.y);


                render_target.fillStyle   = renderable.fill;
                render_target.strokeStyle = renderable.stroke;


                render_target.beginPath();
                render_target.rect(0, 0, renderable.width, renderable.height);
                render_target.fill();
                render_target.stroke();
            }
        };


        return {
            init: function (scene, flags) {
                if (flags.renderable && flags.position) {
                    // required components
                    renderableFlag = flags.renderable;
                    positionFlag   = flags.position;
                    lock |= renderableFlag;
                    lock |= positionFlag;

                    // optional components
                    rotationFlag   = flags.rotation;
                    translationFlag = flags.translation;
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
                var entity, i;

                if (render_target) {
                    console.log('clearing');
                    render_target.clearRect(0, 0, render_target.canvas.width, render_target.canvas.height);
                }

                for (i = 0; i < scene.entities.length; i += 1) {
                    entity = scene.entities[i];
                    if (entity.key & lock === lock) {
                        //draw this
                        console.group('drawing');

                        render_target.save();
                        if (entity.components[renderableFlag].type === "square") {
                            drawRect(entity);
                        }
                        render_target.restore();

                        console.log('square_renderable', entity.components[renderableFlag]);
                        console.log('position',   entity.components[positionFlag]);
                        console.groupEnd();
                    }
                }
            }

        }
    }()),
        OrbitSystem = (function () {
            var lock            = 0,
                translationFlag = 0,
                rotationFlag    = 0,
                period          = 1000,
                radius          = 100,
                current_time    = 0;
            return {
                init: function (scene, flags) {
                    if (flags.translation && flags.rotation) {
                        translationFlag = flags.translation;
                        rotationFlag = flags.rotation;
                        lock |= translationFlag;
                        lock |= rotationFlag;
                    } else {
                        console.error("Required components are not registered");
                    }
                },
                step: function (scene, dt) {
                    console.group('orbiting');
                    var i, entity, interpolation, rotation, translation;
                    for (i = 0; i < scene.entities.length; i += 1) {
                        entity = scene.entities[i];
                        if (entity.key & lock === lock) {
                            rotation = entity.components[rotationFlag];
                            translation = entity.components[translationFlag];
                            current_time = (current_time + dt) % period;
                            interpolation = current_time / period;

                            rotation.angle = (Math.PI * 2) * interpolation;

                            translation.x = Math.cos(rotation.angle) * radius;
                            translation.y = Math.sin(rotation.angle) * radius;

                            console.log('rotation angle', rotation.angle);
                            console.log('position', translation.x, translation.y);
                        }
                    }

                    console.groupEnd();
                }
            }
        }());

    return {
        render_system: RenderSystem,
        orbit_system:  OrbitSystem
    };
});