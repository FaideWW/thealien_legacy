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

requirejs(['alien/alien', 'game/systems', 'game/collision'], function (alien, systems, collision) {
    var INITIAL_BALL_V = 100,
        MAX_V          = Infinity,
        init_angle = Math.random() * Math.PI * 2,
        cf = alien.ComponentFactory,
        left_paddle,
        right_paddle,
        top_paddle,
        bottom_paddle,
        ball,
        score,
        startPrompt,
        menuScene,
        playScene,
        game;

    // define defaults for some components

    cf.defineComponentTemplate('collidable', {
        collidedX: false,
        collidedY: false,
        collision_data: {}
    });

    left_paddle = new alien.Entity({
        renderable: {
            type:        "rect",
            half_height: 56,
            half_width:  4,
            fill:        "rgba(255,255,255,1)",
            stroke:      "rgba(255,255,255,1)"
        },
        position: {
            x: 50,
            y: 50
        },
        collidable: {
            type:        "aabb",
            half_height: 56,
            half_width:  4,
            reaction:    "none"
        },
        velocity: {
            x: 0,
            y: 0
        },
        controller: {
            type: "mouse",
            direction: "y"
        }
    });
    right_paddle = new alien.Entity({
        renderable: {
            type: "rect",
            half_height: 56,
            half_width: 4,
            fill: "rgba(255,255,255,1)",
            stroke: "rgba(255,255,255,1)"
        },
        position: {
            x: 462,
            y: 50
        },
        collidable: {
            type: "aabb",
            half_height: 56,
            half_width:  4,
            reaction: "none"
        },
        velocity: {
            x: 0,
            y: 0
        },
        controller: {
            type: "mouse",
            direction: "y"
        }
    });
    top_paddle = new alien.Entity({
        renderable: {
            type: "rect",
            half_height: 4,
            half_width:  56,
            fill: "rgba(255,255,255,1)",
            stroke: "rgba(255,255,255,1)"
        },
        position: {
            x: 256,
            y: 50
        },
        collidable: {
            type: "aabb",
            half_height: 4,
            half_width:  56,
            reaction: "none"
        },
        velocity: {
            x: 0,
            y: 0
        },
        controller: {
            type: "mouse",
            direction: "x"
        }
    });
    bottom_paddle = new alien.Entity({
        renderable: {
            type: "rect",
            half_height: 4,
            half_width:  56,
            fill: "rgba(255,255,255,1)",
            stroke: "rgba(255,255,255,1)"
        },
        position: {
            x: 256,
            y: 462
        },
        collidable: {
            type: "aabb",
            half_height: 4,
            half_width:  56,
            reaction: "none"
        },
        velocity: {
            x: 0,
            y: 0
        },
        controller: {
            type: "mouse",
            direction: "x"
        }
    });
    ball = new alien.Entity({
        acceleration: {
            x: 0,
            y: 0
        },
        rotation: {
            angle: 0
        },
        spin: {
            angular_v: 0
        },
        renderable: {
            type: "rect",
            half_height: 8,
            half_width:  8,
            fill:        "rgba(255,255,255,1)",
            stroke:      "rgba(255,255,255,1)"
        },
        position: {
            x: 256,
            y: 256
        },
        collidable: {
            type: "aabb",
            half_height: 8,
            half_width:  8,
            reaction:    "bounce"
        },
        velocity: {
            x: 300,
            y: 0
            //x: Math.cos(init_angle) * INITIAL_BALL_V,
            //y: Math.sin(init_angle) * INITIAL_BALL_V
        },
        type: {
            type: "ball"
        }
    });
    score = new alien.Entity({
        renderable: {
            type: "text",
            text: function (state) { return state.points; },
            fill: "rgba(255, 255, 255, 1)",
            font: "32px monospace",
            align: "center"
        },
        position: {
            x: 256,
            y: 256
        }
    });
    startPrompt = new alien.Entity({
        renderable: {
            type: "text",
            text: 'Click here to begin',
            fill: 'rgba(255,255,255,1)',
            stroke: 'rgba(255,255,255,1)',
            font: "32px monospace",
            align: 'center'
        },
        position: {
            x: 256,
            y: 256
        },
        listener: {},
        collidable: {
            type: 'aabb',
            half_height: 256,
            half_width: 256
        }
    });

    game = new alien.Game({
        canvas: "gameCanvas",
        state: {
            points: 0,
            reset: false,
            INITIAL_BALL_VELOCITY: INITIAL_BALL_V,
            MAX_BALL_VELOCITY:     MAX_V
        },
        loopphases: [
            "input",
            "event",
            "collision",
            "physics",
            "render"
        ]
    });

    playScene = new alien.Scene({
        entities: [left_paddle, right_paddle, ball, top_paddle, bottom_paddle, score]
    });
    game.addScene(playScene, "play");

    menuScene = new alien.Scene({
        entities: [startPrompt]
    });

    game.addScene(menuScene, "start");
    game.setActiveScene("start");

    // declare and initialize systems
    collision(game);
    systems(game);

    game.run();

    document.getElementById('play').addEventListener('mousedown', function (e) {
        game.run();
    });
    document.getElementById('pause').addEventListener('mousedown', function (e) {
        game.stop();
    });
    document.getElementById('step').addEventListener('mousedown', function (e) {
        game.__step(16);
    });
    document.getElementById('stepshort').addEventListener('mousedown', function (e) {
        game.__step(1);
    });

    window.addEventListener('keydown', function (key) {
        if (key.keyCode === 32) {
            game.__step(1);
        }
        if (key.keyCode === 68) {
            game.__step(16);
        }
        if (key.keyCode === 65) {
            game.__step(-16);
        }
    });

    window.alien = alien;
    window.game  = game;
});