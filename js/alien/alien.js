/**
 * Created by faide on 2014-03-10.
 */
'use strict';
define(['core/game', 'core/scene', 'core/entity', 'core/math', 'core/componentfactory'],
    function (game, scene, entity, math, cf) {
        return {
            Entity:           entity,
            Game:             game,
            Scene:            scene,
            Math:             math,
            ComponentFactory: cf
        };
    });