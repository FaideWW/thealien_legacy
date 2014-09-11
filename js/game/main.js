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

    var e1          = new alien.Entity(),
        renderable  = new c.square_renderable(),
        position    = new c.position({
            x: 100,
            y: 100
        }),
        rotation    = new c.rotation(),
        translation = new c.translation(),
        collidable  = new c.collidable({
            half_width:  renderable.half_width,
            half_height: renderable.half_height
        }),
        velocity    = new c.velocity({
            x: 0,
            y: 50
        }),
        controller      = new c.paddle_controller();



    window.game = new alien.Game({
        canvas: "gameCanvas"
    });

    window.game.registerComponent(renderable, "renderable");
    e1.addComponent(renderable.flag , renderable);

    window.game.registerComponent(position, "position");
    e1.addComponent(position.flag, position);

    window.game.registerComponent(rotation, "rotation");
    e1.addComponent(rotation.flag, rotation);

    window.game.registerComponent(translation, "translation");
    e1.addComponent(translation.flag, translation);

    window.game.registerComponent(collidable, "collidable");
    e1.addComponent(collidable.flag, collidable);

    window.game.registerComponent(velocity, "velocity");
    e1.addComponent(velocity.flag, velocity);

    window.game.registerComponent(controller, "controller");
    e1.addComponent(controller.flag, controller);


    window.scene1 = new alien.Scene({
        entities: [e1]
    });

    game.addScene(window.scene1, "scene1");
    game.addLoopphase(0, "input");
    game.addLoopphase(1, "event");
    game.addLoopphase(2, "physics");
    game.addLoopphase(3, "render");
    game.addSystem(s.control_system, "input");
    game.addSystem(s.boundary_system, "event");
    game.addSystem(s.physics_system, "physics");
    game.addSystem(s.render_system, "render");

    game.setActiveScene("scene1");

});