/**
 * Created by faide on 2014-03-10.
 */
'use strict';
define(['core/game', 'core/scene', 'core/entity', 'core/math'],
    function (game, scene, entity, math) {
        return {
            Entity: entity,
            Game:   game,
            Scene:  scene,
            Math:   math
        };
    });