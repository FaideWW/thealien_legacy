/**
 * Created by faide on 2014-08-05.
 */

'use strict';
requirejs.config({
    baseUrl: 'js',
    paths: {
        alien: 'alien',
        core: 'alien/core'
    }
});

requirejs(['alien/alien'], function (alien) {

    window.game = new alien.Game({
        canvas: "gameCanvas"
    });

    window.scene1 = new alien.Scene();

    game.addScene(window.scene1, "scene1");

});