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
        renderable = new c.square_renderable(),
        position   = new c.position({
            x: 100,
            y: 50
        }),
        rotation   = new c.rotation(),
        translation = new c.translation();

    window.game = new alien.Game({
        canvas: "gameCanvas"
    });

    window.game.registerComponent(renderable, "renderable");
    e1.addComponent(renderable.flag, renderable);

    window.game.registerComponent(position, "position");
    e1.addComponent(position.flag, position);

    window.game.registerComponent(rotation, "rotation");
    e1.addComponent(rotation.flag, rotation);

    window.game.registerComponent(translation, "translation");
    e1.addComponent(translation.flag, translation);

    window.scene1 = new alien.Scene({
        entities: [e1]
    });

    game.addScene(window.scene1, "scene1");
    game.addLoopphase(0, "event");
    game.addLoopphase(1, "render");
    game.addSystem(s.orbit_system, "event");
    game.addSystem(s.render_system, "render");

    game.setActiveScene("scene1");

});