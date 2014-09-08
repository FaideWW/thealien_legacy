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

requirejs(['alien/alien', 'alien/components', 'alien/systems'], function (alien, c, s) {

    var e1         = new alien.Entity(),
        renderable = new c.renderable(),
        position   = new c.position();

    window.game = new alien.Game({
        canvas: "gameCanvas"
    });

    renderable.flag = window.game.registerComponent("renderable");
    position.flag   = window.game.registerComponent("position");

    e1.addComponent(renderable.flag, renderable);
    e1.addComponent(position.flag, position);

    window.scene1 = new alien.Scene({
        entities: [e1]
    });

    game.addScene(window.scene1, "scene1");
    game.addLoopphase(0, "render");
    game.addSystem(s.render_system, "render");

    game.setActiveScene("scene1");

});