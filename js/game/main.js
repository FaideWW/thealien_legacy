/**
 * Created by faide on 2014-08-05.
 */

'use strict';
requirejs.config({
    baseUrl: 'js',
    paths: {
        alien: 'alien',
        core: 'alien/core',
        lodash: 'vendor/lodash.min'
    }
});

requirejs(['alien/alien', 'alien/components', 'alien/systems'], function (alien, c, s) {

    var INITIAL_BALL_V = 100,
        left_paddle          = new alien.Entity(),
        vert_renderable  = new c.square_renderable({
            half_height: 56,
            half_width:  4,
            fill:        "rgba(255,255,255,1)",
            stroke:      "rgba(255,255,255,1)"
        }),
        position    = new c.position({
            x: 50,
            y: 50
        }),
        rotation    = new c.rotation(),
        translation = new c.translation(),
        aabb_collidable  = new c.aabb_collidable({
            half_width:  vert_renderable.half_width,
            half_height: vert_renderable.half_height,
            reaction:    "none"
        }),
        velocity    = new c.velocity(),
        p_y_controller      = new c.paddle_controller({
            direction: "y"
        }),

        ball = new alien.Entity(),
        r2 = new c.square_renderable({
            half_height: 8,
            half_width:  8,
            fill:        "rgba(255,255,255,1)",
            stroke:      "rgba(255,255,255,1)"
        }),
        p2 = new c.position({
            x: 256,
            y: 256
        }),
        accel = new c.acceleration(),
        c2 = new c.aabb_collidable({
            half_width: r2.half_width,
            half_height: r2.half_height
        }),
        init_angle = Math.random() * Math.PI * 2,
        v2 = new c.velocity({
            x: Math.cos(init_angle) * INITIAL_BALL_V,
            y: Math.sin(init_angle) * INITIAL_BALL_V
        }),
        right_paddle = new alien.Entity(),
        p3           = new c.position({
            x: 462,
            y: 50
        }),
        c3           = new c.aabb_collidable({
            half_width:  vert_renderable.half_width,
            half_height: vert_renderable.half_height
        }),
        v3           = new c.velocity(),
        top_paddle = new alien.Entity(),
        horiz_renderable = new c.square_renderable({
            half_height: 4,
            half_width: 56,
            fill:        "rgba(255,255,255,1)",
            stroke:      "rgba(255,255,255,1)"

        }),
        bottom_paddle = new alien.Entity(),
        p4 = new c.position({
            x: 256,
            y: 50
        }),
        p5 = new c.position({
            x: 256,
            y: 462
        }),
        v4 = new c.velocity(),
        v5 = new c.velocity(),
        p_x_controller = new c.paddle_controller({
            direction: "x"
        }),
        c4 = new c.aabb_collidable({
            half_width: horiz_renderable.half_width,
            half_height: horiz_renderable.half_height
        }),
        c5 = new c.aabb_collidable({
            half_width: horiz_renderable.half_width,
            half_height: horiz_renderable.half_height
        }),
        t = new c.type({
            type: "ball"
        }),
        spin = new c.spin();



    window.game = new alien.Game({
        canvas: "gameCanvas",
        state: {
            points: 0,
            reset: false,
            INITIAL_BALL_VELOCITY: INITIAL_BALL_V
        }
    });

    window.game.registerComponent(vert_renderable, "renderable");
    window.game.registerComponent(r2, "renderable");
    window.game.registerComponent(horiz_renderable, "renderable");
    left_paddle.addComponent(vert_renderable.flag , vert_renderable);
    right_paddle.addComponent(vert_renderable.flag, vert_renderable);
    top_paddle.addComponent(horiz_renderable.flag, horiz_renderable);
    bottom_paddle.addComponent(horiz_renderable.flag, horiz_renderable);

    window.game.registerComponent(position, "position");
    window.game.registerComponent(p2, "position");
    window.game.registerComponent(p3, "position");
    window.game.registerComponent(p4, "position");
    window.game.registerComponent(p5, "position");
    left_paddle.addComponent(position.flag, position);
    right_paddle.addComponent(p3.flag, p3);
    top_paddle.addComponent(p4.flag, p4);
    bottom_paddle.addComponent(p5.flag, p5);

    window.game.registerComponent(translation, "translation");
    left_paddle.addComponent(translation.flag, translation);

    window.game.registerComponent(aabb_collidable, "collidable");
    window.game.registerComponent(c2, "collidable");
    window.game.registerComponent(c3, "collidable");
    window.game.registerComponent(c4, "collidable");
    window.game.registerComponent(c5, "collidable");
    left_paddle.addComponent(aabb_collidable.flag, aabb_collidable);
    right_paddle.addComponent(c3.flag, c3);
    top_paddle.addComponent(c4.flag, c4);
    bottom_paddle.addComponent(c5.flag, c5);

    window.game.registerComponent(velocity, "velocity");
    window.game.registerComponent(v2, "velocity");
    window.game.registerComponent(v3, "velocity");
    window.game.registerComponent(v4, "velocity");
    window.game.registerComponent(v5, "velocity");
    left_paddle.addComponent(velocity.flag, velocity);
    right_paddle.addComponent(v3.flag, v3);
    top_paddle.addComponent(v4.flag, v4);
    bottom_paddle.addComponent(v5.flag, v5);

    // allow ball to spin
    window.game.registerComponent(accel, "acceleration");
    ball.addComponent(accel.flag, accel);

    window.game.registerComponent(rotation, "rotation");
    ball.addComponent(rotation.flag, rotation);

    window.game.registerComponent(spin, "spin");
    ball.addComponent(spin.flag, spin);


    window.game.registerComponent(p_y_controller, "controller");
    window.game.registerComponent(p_x_controller, "controller");
    left_paddle.addComponent(p_y_controller.flag, p_y_controller);
    right_paddle.addComponent(p_y_controller.flag, p_y_controller);
    top_paddle.addComponent(p_x_controller.flag, p_x_controller);
    bottom_paddle.addComponent(p_x_controller.flag, p_x_controller);
    //e1.addComponent(m_controller.flag, m_controller);


    window.game.registerComponent(t, "type");


    ball.addComponent(r2.flag, r2);
    ball.addComponent(p2.flag, p2);
    ball.addComponent(c2.flag, c2);
    ball.addComponent(v2.flag, v2);
    ball.addComponent(t.flag,  t);



    var score_n = new alien.Entity(),
        n_text  = new c.text_renderable({
            track: game.__state,
            text: function () { return this.track.points; },
            fill: "rgba(255, 255, 255, 1)",
            font: "32px monospace",
            align: "center"
        }),
        n_pos   = new c.position({
            x: window.game.ctx.canvas.width / 2,
            y: window.game.ctx.canvas.height / 2
        });

    console.log(n_text);

    window.game.registerComponent(n_text, "renderable");
    window.game.registerComponent(n_pos, "position");

    score_n.addComponent(n_text.flag, n_text);
    score_n.addComponent(n_pos.flag, n_pos);

    window.scene1 = new alien.Scene({
        entities: [left_paddle, right_paddle, ball, top_paddle, bottom_paddle, score_n]
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


    var startPrompt = new alien.Entity(),
        startText   = new c.text_renderable({
            text: 'Click here to begin',
            fill: 'rgba(255,255,255,1)',
            stroke: 'rgba(255,255,255,1)',
            font: "32px monospace",
            align: 'center'
        }),
        startPos    = new c.position({
            x: 256,
            y: 256
        }),
        startListener = new c.menu_listener(),
        startCollidable = new c.aabb_collidable({
            half_width: 256,
            half_height: 256
        });

    game.registerComponent(startText, "renderable");
    game.registerComponent(startPos, "position");
    game.registerComponent(startListener, "listener");
    game.registerComponent(startCollidable, "collidable");
    startPrompt.addComponent(startText.flag, startText);
    startPrompt.addComponent(startPos.flag, startPos);
    startPrompt.addComponent(startListener.flag, startListener);
    startPrompt.addComponent(startCollidable.flag, startCollidable);

    game.addSystem(s.start_menu_system, "input");

    var startScene = new alien.Scene({
        entities: [startPrompt]
    });

    game.addScene(startScene, "start");
    game.setActiveScene("start");


    game.run();
});