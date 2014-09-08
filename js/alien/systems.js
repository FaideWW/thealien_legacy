/**
 * Created by faide on 2014-09-05.
 */

define([], function () {
    var RenderSystem = (function () {
        var lock           = 0,
            renderableFlag = 0,
            positionFlag   = 0;
        return {
            init: function (scene, flags) {
                if (flags.renderable && flags.position) {
                    renderableFlag = flags.renderable;
                    positionFlag   = flags.position;
                    lock |= renderableFlag;
                    lock |= positionFlag;
                }
            },
            step: function (scene) {
                var entity, i;
                for (i = 0; i < scene.entities.length; i += 1) {
                    entity = scene.entities[i];
                    if (entity.key & lock === lock) {
                        //draw this
                        console.group('drawing');
                        console.log('renderable', entity.components[renderableFlag]);
                        console.log('position',   entity.components[positionFlag]);
                        console.groupEnd();
                    }
                }
            }

        }
    }());

    return {
        render_system: RenderSystem
    };
});