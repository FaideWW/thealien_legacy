require(['alien/alien'], function (alien) {
    'use strict';
    var canvas = document.getElementById("gameCanvas"),
        game = new alien.Game({
            canvas:    canvas,
            fps:       60,
            autopause: true
        }),
        an      = alien.components.AnimationFactory,
        cm      = alien.components.CameraFactory,
        cl      = alien.components.CollidableFactory,
        cn      = alien.components.ControllerFactory,
        r       = alien.components.RenderableFactory,
        m       = alien.components.MovableFactory,
        t       = alien.components.TransformableFactory,
        am      = alien.utilities.Math,
        polygon = am.Polygon.factory.create(4, 20, true),
        radius  = 10,
        speed   = 100,
        key_map = [
            cn.createKeyBinding('w', function (event, mod) {
                /* up keydown */
                this.movable.jumping = true;
                this.movable.onGround = false;
                this.movable.velocity.y = -200;
            }, function () {}, true),
            cn.createKeyBinding('a', function (event, mod) {
                /* left keydown */
                if (!this.movable.crouching) {
                    this.movable.velocity.x = -speed;
                    this.movable.facingRight = false;
                    this.movable.facingLeft = true;
                    this.movable.movingRight = false;
                    this.movable.movingLeft = true;
                    if (mod[16]) {
                        this.movable.velocity.x = -speed * 2;
                        this.movable.running = true;
                    } else {
                        this.movable.running = false;
                    }
                } else if (this.movable.sliding && this.movable.velocity.x < 0) {
                    this.movable.velocity.x *= 0.9;
                }
            }, function () {
                /* left keyup */
                this.movable.movingLeft = false;
                this.movable.running = false;
                if (this.movable.onGround) {
                    this.movable.velocity.x = 0;
                }
            }),
            cn.createKeyBinding('s', function (event, mod) {
                this.movable.crouching = true;
                /* Continue a slide if the shift key is no longer pressed */
                if ((mod[16] && this.movable.velocity.x !== 0) || this.sliding) {
                    this.movable.sliding = true;
                }
                if (this.movable.velocity.x === 0) {
                    this.movable.sliding = false;
                }
            }, function () {
                this.movable.crouching = false;
                this.movable.sliding = false;
            }),
            cn.createKeyBinding('d', function (event, mod) {
                /* right keydown */
                if (!this.movable.crouching) {
                    this.movable.velocity.x = speed;
                    this.movable.facingLeft = false;
                    this.movable.facingRight = true;
                    this.movable.movingLeft = false;
                    this.movable.movingRight = true;
                    if (mod[16]) {
                        this.movable.velocity.x = speed * 2;
                        this.movable.running = true;
                    } else {
                        this.movable.running = false;
                    }
                } else if (this.movable.sliding && this.movable.velocity.x > 0) {
                    this.movable.velocity.x *= 0.9;
                }
            }, function () {
                /* right keyup */
                this.movable.movingRight = false;
                this.movable.running = false;
                if (this.movable.onGround) {
                    this.movable.velocity.x = 0;
                }
            }),
            cn.createKeySequence('f,o,o', function () {
                console.log('bar');
            }),
            cn.createKeySequence('b,a,z', function () {
                console.log('baz');
            }, true),
            cn.createKeyCombination('shift+r', function () {
                console.log('rty');
            })
        ],
        mouse_map = cn.createMouseMap(
            function () {},
            function () {},
            function () {}
        ),
        framerate = 15,
        player_animations = an.createAnimationSet("img/kirby.png", {
            idle_right: {
                frames: [
                    an.createFrame(3, 0, 20, 20),
                    an.createFrame(3, 0, 20, 20),
                    an.createFrame(3, 0, 20, 20),
                    an.createFrame(3, 0, 20, 20),
                    an.createFrame(3, 0, 20, 20),
                    an.createFrame(3, 0, 20, 20),
                    an.createFrame(3, 0, 20, 20),
                    an.createFrame(3, 0, 20, 20),
                    an.createFrame(3, 0, 20, 20),
                    an.createFrame(3, 0, 20, 20),
                    an.createFrame(27, 0, 20, 20)
                ],
                predicate: function () {
                    return (this.movable.onGround && this.movable.facingRight && this.movable.velocity.x === 0 && !this.movable.crouching);
                },
                options: {
                    framerate: 10
                }
            },
            crouch_right: {
                frames: [
                    an.createFrame(66, 26, 23, 20)
                ],
                predicate: function () {
                    return (this.movable.onGround && this.movable.crouching && this.movable.facingRight && this.movable.velocity.x === 0);
                },
                options: {
                    loops: false,
                    framerate: framerate,
                    priority: 1
                }
            },
            walk_right: {
                frames: [
                    an.createFrame(3, 49, 21, 21),
                    an.createFrame(28, 50, 20, 20),
                    an.createFrame(52, 50, 20, 20),
                    an.createFrame(74, 50, 20, 20),
                    an.createFrame(96, 50, 20, 20),
                    an.createFrame(117, 49, 21, 21),
                    an.createFrame(142, 50, 20, 20),
                    an.createFrame(166, 50, 20, 20),
                    an.createFrame(189, 50, 20, 20),
                    an.createFrame(212, 50, 20, 20)
                ],
                predicate: function () {
                    return this.movable.onGround && (this.movable.facingRight && (this.movable.velocity.x > 0 && !this.movable.running));
                },
                options: {
                    framerate: function (dt) {
                        return Math.abs(this.movable.velocity.x) / speed * framerate;
                    },
                    loops: true
                }
            },
            run_right: {
                frames: [
                    an.createFrame(3, 74, 20, 20),
                    an.createFrame(26, 74, 20, 20),
                    an.createFrame(48, 74, 20, 20),
                    an.createFrame(69, 74, 20, 20),
                    an.createFrame(92, 74, 24, 20),
                    an.createFrame(120, 74, 20, 20),
                    an.createFrame(143, 74, 20, 20),
                    an.createFrame(164, 74, 20, 20)
                ],
                predicate: function () {
                    return this.movable.onGround && (this.movable.facingRight && (this.movable.velocity.x > 0 && this.movable.running));
                },
                options: {
                    framerate: framerate,
                    priority: 1,
                    loops: true
                }
            },
            slide_right: {
                frames: [
                    an.createFrame(36, 25, 22, 20),
                    an.createFrame(5, 25, 27, 20)
                ],
                predicate: function () {
                    return this.movable.onGround && (this.movable.movingRight && this.movable.sliding);
                },
                options: {
                    loops: false,
                    framerate: framerate,
                    priority: 1
                }
            },
            air_up_right: {
                frames: [
                    an.createFrame(4, 98, 20, 20)
                ],
                predicate: function () {
                    return (!this.movable.onGround && (this.movable.facingRight && (this.movable.jumping && this.movable.velocity.y < 0)));
                },
                options: {
                    framerate: framerate,
                    loops: false
                }
            },
            air_flip_right: {
                frames: [
                    an.createFrame(24, 98, 21, 20),
                    an.createFrame(49, 98, 20, 20),
                    an.createFrame(73, 98, 21, 20),
                    an.createFrame(98, 98, 20, 20),
                    an.createFrame(122, 98, 21, 20),
                    an.createFrame(147, 98, 22, 20),
                    an.createFrame(173, 98, 21, 20),
                    an.createFrame(198, 98, 20, 20)
                ],
                predicate: function () {
                    return (!this.movable.onGround && (this.movable.facingRight && (this.movable.jumping && this.movable.velocity.y >= 0)));
                },
                options: {
                    framerate: framerate,
                    loops: false,
                    synchronized: true
                }
            },
            air_down_right: {
                frames: [
                    an.createFrame(225, 97, 20, 21)
                ],
                predicate: function () {
                    return (!this.movable.onGround && (this.movable.facingRight && (!this.movable.jumping && this.movable.velocity.y > 0)));
                },
                options: {
                    loops: false,
                    framerate: framerate
                }
            },
            idle_left: {
                frames: [
                    an.createFrame(953, 0, 20, 20),
                    an.createFrame(953, 0, 20, 20),
                    an.createFrame(953, 0, 20, 20),
                    an.createFrame(953, 0, 20, 20),
                    an.createFrame(953, 0, 20, 20),
                    an.createFrame(953, 0, 20, 20),
                    an.createFrame(953, 0, 20, 20),
                    an.createFrame(953, 0, 20, 20),
                    an.createFrame(953, 0, 20, 20),
                    an.createFrame(953, 0, 20, 20),
                    an.createFrame(929, 0, 20, 20)
                ],
                predicate: function () {
                    return (this.movable.onGround && this.movable.facingLeft && this.movable.velocity.x === 0 && !this.movable.crouching);
                },
                options: {
                    framerate: 10
                }
            },
            crouch_left: {
                frames: [
                    an.createFrame(887, 26, 23, 20)
                ],
                predicate: function () {
                    return (this.movable.onGround && this.movable.crouching && this.movable.facingLeft && this.movable.velocity.x === 0);
                },
                options: {
                    loops: false,
                    framerate: framerate,
                    priority: 1
                }
            },
            walk_left: {
                frames: [
                    an.createFrame(952, 49, 21, 21),
                    an.createFrame(928, 50, 20, 20),
                    an.createFrame(905, 50, 20, 20),
                    an.createFrame(884, 50, 20, 20),
                    an.createFrame(863, 50, 20, 20),
                    an.createFrame(838, 49, 21, 21),
                    an.createFrame(814, 50, 20, 20),
                    an.createFrame(791, 50, 20, 20),
                    an.createFrame(768, 50, 20, 20),
                    an.createFrame(744, 50, 20, 20)
                ],
                predicate: function () {
                    return this.movable.onGround && (this.movable.facingLeft && (this.movable.velocity.x < 0 && !this.movable.running));
                },
                options: {
                    framerate: function () {
                        return Math.abs(this.movable.velocity.x) / speed * framerate;
                    },
                    loops: true
                }
            },
            run_left: {
                frames: [
                    an.createFrame(954, 74, 20, 20),
                    an.createFrame(932, 74, 20, 20),
                    an.createFrame(911, 74, 20, 20),
                    an.createFrame(888, 74, 20, 20),
                    an.createFrame(860, 74, 24, 20),
                    an.createFrame(837, 74, 20, 20),
                    an.createFrame(816, 74, 20, 20),
                    an.createFrame(794, 74, 20, 20)
                ],
                predicate: function () {
                    return this.movable.onGround && (this.movable.facingLeft && (this.movable.velocity.x < 0 && this.movable.running));
                },
                options: {
                    framerate: framerate,
                    priority: 1,
                    loops: true
                }
            },
            slide_left: {
                frames: [
                    an.createFrame(918, 25, 22, 20),
                    an.createFrame(944, 25, 27, 20)
                ],
                predicate: function () {
                    return this.movable.onGround && (this.movable.movingLeft && this.movable.sliding);
                },
                options: {
                    loops: false,
                    framerate: framerate,
                    priority: 1
                }
            },
            air_up_left: {
                frames: [
                    an.createFrame(952, 98, 20, 20)
                ],
                predicate: function () {
                    return (!this.movable.onGround && (this.movable.facingLeft && (this.movable.jumping && this.movable.velocity.y < 0)));
                },
                options: {
                    framerate: framerate,
                    loops: false
                }
            },
            air_flip_left: {
                frames: [
                    an.createFrame(931, 98, 21, 20),
                    an.createFrame(907, 98, 20, 20),
                    an.createFrame(882, 98, 21, 20),
                    an.createFrame(858, 98, 20, 20),
                    an.createFrame(833, 98, 21, 20),
                    an.createFrame(807, 98, 22, 20),
                    an.createFrame(782, 98, 21, 20),
                    an.createFrame(758, 98, 20, 20)
                ],
                predicate: function () {
                    return (!this.movable.onGround && (this.movable.facingLeft && (this.movable.jumping && this.movable.velocity.y >= 0)));
                },
                options: {
                    framerate: framerate,
                    loops: false,
                    synchronized: true
                }
            },
            air_down_left: {
                frames: [
                    an.createFrame(731, 97, 20, 21)
                ],
                predicate: function () {
                    return (!this.movable.onGround && (this.movable.facingLeft && (!this.movable.jumping && this.movable.velocity.y > 0)));
                },
                options: {
                    loops: false,
                    framerate: framerate
                }
            }
        }, "idle_right"),
        e = [
            new alien.Entity({
                id: "player",
                animatable: player_animations,
                camera: cm.createCamera(canvas.width / 2, canvas.height / 2, canvas.width / 4, canvas.height / 4, canvas.height / 4),
                collidable: cl.createBoundingPolygon(polygon.rotate(Math.PI / 4)),
                movable: m.createMovable(true),
                keylistener: cn.createKeyListener(key_map),
                mouselistener: cn.createMouseListener(mouse_map),
                position: new am.Vector({x: 205, y: 205}),
                transformable: t.createTransformable(null, null, null)
            }),
            new alien.Entity({
                collidable: cl.createBoundingPolygon(polygon),
                movable: m.createMovable(),
                position: new am.Vector({x: 140, y: 50}),
                renderable: r.createRenderPolygon(polygon, "rgba(0,0,0,1)", "rgba(255,255,0,1)")
            }),
            new alien.Entity({
                collidable: cl.createBoundingCircle(radius),
                movable: m.createMovable(),
                position: new am.Vector({x: 205, y: 165}),
                renderable: r.createRenderCircle(radius, null, "rgba(100,100,100,1)")
            })
        ],
        map = new alien.Map({
            tile_width: 20,
            tile_height: 20,
            tileset: {
                tilesheet: "img/tileset.png",
                tiles: {
                    GROUND: {
                        x: 0,
                        y: 0,
                        w: 20,
                        h: 20
                    },
                    WALL: {
                        x: 20,
                        y: 0,
                        w: 20,
                        h: 20
                    }
                }
            },
            background: "rgba(100,255,255,1)",
            tilemap: {
                "_": 'GROUND',
                "#": 'WALL'
            },
            player_spawn: 'p',
            slopetile: '-',
            mapdata: [
                "#################    ####################",
                "#                                       #",
                "#                                       #",
                "#                                       #",
                "#               -____-                  #",
                "#              -######-                 #",
                "#             -########-                #",
                "# p          -##########-               #",
                "#___________##############______________#"
            ]
        }),
        s = new alien.Scene(null, map, e);



    game.addScene(s).loadScene(s.id);


    /* Debug hooks */
    window.game = game;
    window.alien = alien;
    window.player = game.scenes.scene_0.entities.player;

});

require.config({
    paths: {
        underscore: "../vendor/underscore.min",
        alien: "../alien"
    }
});
