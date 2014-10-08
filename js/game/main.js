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

requirejs(['alien/alien', 'game/systems'], function (alien, s) {
    var INITIAL_BALL_V = 100,
        init_angle = Math.random() * Math.PI * 2,
        cf = alien.ComponentFactory;

    // define defaults for some components

    cf.defineComponentTemplate('collidable', {
        collidedX: false,
        collidedY: false,
        collision_data: {}
    });

    var left_paddle = new alien.Entity({
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
        }),
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
            }),
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
        }),
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
        }),
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
                x: Math.cos(init_angle) * INITIAL_BALL_V,
                y: Math.sin(init_angle) * INITIAL_BALL_V
            },
            type: {
                type: "ball"
            }
        }),
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
        }),
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
                half_height: 256,
                half_width: 256
            }
        });

    window.scene1 = new alien.Scene({
        entities: [left_paddle, right_paddle, ball, top_paddle, bottom_paddle, score]
    });


    window.game = new alien.Game({
        canvas: "gameCanvas",
        state: {
            points: 0,
            reset: false,
            INITIAL_BALL_VELOCITY: INITIAL_BALL_V
        },
        loopphases: [
            "input",
            "event",
            "physics",
            "collision",
            "render"
        ]
    });

    game.addScene(window.scene1, "scene1");

    var startScene = new alien.Scene({
        entities: [startPrompt]
    });

    game.addScene(startScene, "start");
    game.setActiveScene("start");


//    StartMenuSystem = (function () {
//        var _flags = null,
//            lock   = 0;
//        return {
//            init: function (scene, flags) {
//                _flags = flags;
//                if (_flags.renderable && _flags.position && _flags.listener && _flags.collidable) {
//                    lock |= _flags.renderable;
//                    lock |= _flags.position;
//                    lock |= _flags.listener;
//                    lock |= _flags.collidable;
//                } else {
//                    throw new Error('Required components not registered');
//                }
//            },
//            step: function (scene) {
//            }
//        }
//    }())

    s(game);

    game.run();


    window.alien = alien;
});