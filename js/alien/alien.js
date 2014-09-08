/**
 * Created by faide on 2014-03-10.
 */
'use strict';
define(['core/game', 'core/scene', 'core/entity'],
    function (game, scene, entity) {
        return {
            Entity: entity,
            Game: game,
            Scene: scene
        };
    });