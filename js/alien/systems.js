/**
 * Created by faide on 2014-09-05.
 */

define([], function () {
    var SquareRenderSystem = (function () {
        var lock           = 0,
            renderableFlag = 0,
            positionFlag   = 0,
            render_target  = null;
        return {
            init: function (scene, flags) {
                if (flags.renderable && flags.position) {
                    renderableFlag = flags.renderable;
                    positionFlag   = flags.position;
                    lock |= renderableFlag;
                    lock |= positionFlag;
                }
                if (!scene.renderTarget) {
                    console.error('Scene has no render target');
                } else {
                    render_target = scene.renderTarget;
                }
            },
            step: function (scene) {
                var entity, i;

                for (i = 0; i < scene.entities.length; i += 1) {
                    entity = scene.entities[i];
                    if (entity.key & lock === lock) {
                        //draw this
                        console.group('drawing');

                        if (entity.components[renderableFlag].type === "square") {
                            if (render_target) {
                                render_target.save();
                                render_target.translate(entity.components[positionFlag].x, entity.components[positionFlag].y);

                                render_target.fillStyle   = entity.components[renderableFlag].fill;
                                render_target.strokeStyle = entity.components[renderableFlag].stroke;

                                render_target.fillRect(0, 0, entity.components[renderableFlag].width, entity.components[renderableFlag].height);
                                render_target.restore();
                            }
                        }

                        console.log('square_renderable', entity.components[renderableFlag]);
                        console.log('position',   entity.components[positionFlag]);
                        console.groupEnd();
                    }
                }
            }

        }
    }());

    return {
        square_render_system: SquareRenderSystem
    };
});