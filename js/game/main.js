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
        renderable  = new c.square_renderable({
            half_height: 28,
            half_width:  4,
            fill:        "rgba(255,255,255,1)",
            stroke:      "rgba(255,255,255,1)"
        }),
        position    = new c.position({
            x: 50,
            y: 100
        }),
        rotation    = new c.rotation(),
        translation = new c.translation(),
        aabb_collidable  = new c.aabb_collidable({
            half_width:  renderable.half_width,
            half_height: renderable.half_height,
            reaction:    "none"
        }),
        velocity    = new c.velocity(),
        p_controller      = new c.paddle_controller(),
        m_controller      = new c.mouse_controller(),

        e2 = new alien.Entity(),
        r2 = new c.square_renderable({
            half_height: 10,
            half_width: 10,
            fill:        "rgba(255,255,255,1)"
        }),
        p2 = new c.position({
            x: 300,
            y: 300
        }),
        c2 = new c.aabb_collidable({
            half_width: r2.half_width,
            half_height: r2.half_height
        }),
        v2 = new c.velocity({
            x: -50,
            y: 50
        });



    window.game = new alien.Game({
        canvas: "gameCanvas"
    });

    window.game.registerComponent(renderable, "renderable");
    window.game.registerComponent(r2, "renderable");
    e1.addComponent(renderable.flag , renderable);

    window.game.registerComponent(position, "position");
    window.game.registerComponent(p2, "position");
    e1.addComponent(position.flag, position);

    window.game.registerComponent(rotation, "rotation");
    e1.addComponent(rotation.flag, rotation);

    window.game.registerComponent(translation, "translation");
    e1.addComponent(translation.flag, translation);

    window.game.registerComponent(aabb_collidable, "collidable");
    window.game.registerComponent(c2, "collidable");
    e1.addComponent(aabb_collidable.flag, aabb_collidable);

    window.game.registerComponent(velocity, "velocity");
    window.game.registerComponent(v2, "velocity");
    e1.addComponent(velocity.flag, velocity);

    window.game.registerComponent(p_controller, "controller");
    window.game.registerComponent(m_controller, "controller");
    e1.addComponent(p_controller.flag, p_controller);
    //e1.addComponent(m_controller.flag, m_controller);


    e2.addComponent(r2.flag, r2);
    e2.addComponent(p2.flag, p2);
    e2.addComponent(c2.flag, c2);
    e2.addComponent(v2.flag, v2);

    window.scene1 = new alien.Scene({
        entities: [e1, e2]
    });

    game.addScene(window.scene1, "scene1");
    game.addLoopphase(0, "input");
    game.addLoopphase(1, "event");
    game.addLoopphase(2, "physics");
    game.addLoopphase(3, "collision");
    game.addLoopphase(4, "render");
    game.addSystem(s.control_system, "input");
    game.addSystem(s.bounce_system, "physics");
    game.addSystem(s.impulse_system, "physics");
    game.addSystem(s.physics_system, "physics");
    game.addSystem(s.collision_system, "collision");
    game.addSystem(s.render_system, "render");
    game.addSystem(s.pong_boundary_system, "collision");

    game.setActiveScene("scene1");

});