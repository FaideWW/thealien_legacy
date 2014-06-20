require(['alien/alien'], function (alien) {
    'use strict';
    var canvas = document.getElementById("gameCanvas"),
        game = new alien.Game({
            canvas: canvas,
            fps:    60
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
            cn.createKeyBinding('w', function () {
                /* up keydown */
                this.movable.jumping = true;
                this.movable.onGround = false;
                this.movable.velocity.y = -200;
            }, function () { /* this.movable.velocity.y =  speed; */ }, true),
            cn.createKeyBinding('a', function () {
                /* left keydown */
                this.movable.velocity.x -= speed;
                this.movable.facingRight = false;
                this.movable.facingLeft = true;
            }, function () {
                /* left keyup */
                this.movable.velocity.x += speed;
            }, true),
            cn.createKeyBinding('d', function () {
                /* right keydown */
                this.movable.velocity.x +=  speed;
                this.movable.facingLeft = false;
                this.movable.facingRight = true;
            }, function () {
                /* right keyup */
                this.movable.velocity.x -= speed;
            }, true)
        ],
        mouse_map = cn.createMouseMap(
            function () {},
            function () {},
            function () {}
        ),
        framerate = 15,
        robot_animations = an.createAnimationSet("img/robot.png", {
            idle_right: {
                frames: [
                    an.createFrame(34, 625, 144 - 34, 757 - 625),
                    an.createFrame(159, 624, 269 - 159, 757 - 624),
                    an.createFrame(275, 626, 384 - 275, 757 - 626),
                    an.createFrame(417, 626, 527 - 417, 757 - 626),
                    an.createFrame(534, 627, 643 - 534, 757 - 627),
                    an.createFrame(650, 627, 758 - 650, 757 - 627),
                    an.createFrame(785, 627, 893 - 785, 757 - 627),
                    an.createFrame(1045, 628, 1154 - 1045, 757 - 628)
                ],
                predicate: function () {
                    return (this.movable.onGround && this.movable.facingRight && this.movable.velocity.x === 0 && !this.movable.crouching);

                },
                options: {
                    framerate: 24
                }
            },
            walk_right: {
                frames: [
                    an.createFrame(20, 0, 130, 130),
                    an.createFrame(135, 0, 246 - 135, 130),
                    an.createFrame(248, 1, 359 - 248, 131 - 1),
                    an.createFrame(360, 1, 470 - 360, 131 - 1),
                    an.createFrame(478, 2, 589 - 478, 131 - 2),
                    an.createFrame(592, 0, 699 - 592, 131 - 0),
                    an.createFrame(707, 0, 814 - 707, 132 - 0),
                    an.createFrame(814, 4, 918 - 814, 135 - 4),
                    an.createFrame(926, 0, 1026 - 926, 136 - 0),
                    an.createFrame(1042, 1, 1139 - 1042, 137 - 1),
                    an.createFrame(1153, 0, 1250 - 1153, 136 - 0),
                    an.createFrame(1262, 1, 1358 - 1262, 137 - 1),
                    an.createFrame(1368, 2, 1465 - 1368, 138 - 2),
                    an.createFrame(1470, 1, 1569 - 1470, 138 - 1),
                    an.createFrame(1572, 0, 1674 - 1572, 130 - 0),
                    an.createFrame(1676, 6, 1770 - 1676, 139 - 6),
                    an.createFrame(1774, 5, 1869 - 1774, 139 - 5),
                    an.createFrame(1870, 6, 1972 - 1870, 138 - 6),
                    an.createFrame(1976, 0, 2082 - 1976, 138 - 0),
                    an.createFrame(20, 173, 128 - 20, 301 - 173),
                    an.createFrame(136, 173, 244 - 136, 300 - 173),
                    an.createFrame(249, 173, 357 - 249, 300 - 173),
                    an.createFrame(363, 173, 470 - 363, 301 - 173),
                    an.createFrame(363, 173, 470 - 363, 301 - 173),
                    an.createFrame(476, 173, 584 - 476, 300 - 173),
                    an.createFrame(590, 173, 697 - 590, 300 - 173),
                    an.createFrame(700, 173, 807 - 700, 301 - 173),
                    an.createFrame(808, 171, 910 - 808, 301 - 171),
                    an.createFrame(924, 172, 1026 - 924, 302 - 172),
                    an.createFrame(1035, 172, 1137 - 1035, 302 - 172),
                    an.createFrame(1146, 170, 1249 - 1146, 300 - 170),
                    an.createFrame(1257, 172, 1369 - 1257, 302 - 172),
                    an.createFrame(1376, 170, 1471 - 1376, 300 - 170),
                    an.createFrame(1490, 170, 1580 - 1490, 300 - 170),
                    an.createFrame(1587, 169, 1676 - 1587, 299 - 169),
                    an.createFrame(1695, 169, 1784 - 1695, 301 - 169),
                    an.createFrame(1806, 168, 1896 - 1806, 299 - 168),
                    an.createFrame(1918, 173, 2007 - 1918, 304 - 173),
                    an.createFrame(2030, 173, 2119 - 2030, 304 - 173),
                    an.createFrame(38, 347, 127 - 38, 481 - 347),
                    an.createFrame(149, 347, 243 - 149, 481 - 347),
                    an.createFrame(253, 347, 350 - 253, 481 - 347),
                    an.createFrame(352, 347, 453 - 352, 480 - 347),
                    an.createFrame(475, 348, 571 - 475, 481 - 348),
                    an.createFrame(598, 347, 692 - 598, 480 - 347),
                    an.createFrame(718, 347, 812 - 718, 481 - 347),
                    an.createFrame(822, 346, 918 - 822, 481 - 346),
                    an.createFrame(922, 346, 1021 - 922, 480 - 346),
                    an.createFrame(1037, 344, 1139 - 1037, 479 - 344),
                    an.createFrame(1142, 345, 1248 - 1142, 476 - 345),
                    an.createFrame(1252, 343, 1363 - 1252, 475 - 343),
                    an.createFrame(1367, 346, 1477 - 1367, 474 - 346),
                    an.createFrame(1485, 346, 1595 - 1485, 474 - 346),
                    an.createFrame(1608, 347, 1720 - 1608, 475 - 347),
                    an.createFrame(1736, 347, 1848 - 1736, 475 - 347),
                    an.createFrame(1851, 347, 1963 - 1851, 475 - 347),
                    an.createFrame(1970, 348, 2083 - 1970, 475 - 348)
                ],
                predicate: function () {
                    return this.movable.onGround && (this.movable.facingRight && (this.movable.velocity.x > 0 && !this.movable.running));

                },
                options: {
                    framerate: 24
                }
            }
        }, "idle_right"),
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
                    return (this.movable.onGround && this.movable.facingRight && this.movable.velocity.x === 0);
                },
                options: {
                    framerate: 5
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
                    return this.movable.onGround && (this.movable.facingRight && this.movable.velocity.x > 0);
                },
                options: {
                    framerate: framerate,
                    loops: true
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
                    return (this.movable.onGround && this.movable.facingLeft && this.movable.velocity.x === 0);
                },
                options: {
                    framerate: framerate
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
                    return this.movable.onGround && (this.movable.facingLeft && this.movable.velocity.x < 0);
                },
                options: {
                    framerate: framerate,
                    loops: true
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
                animatable: robot_animations,
                //camera: cm.createCamera(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2),
                collidable: cl.createAABB(107 / 2, 132 / 2),
                movable: m.createMovable(true),
                keylistener: cn.createKeyListener(key_map),
                mouselistener: cn.createMouseListener(mouse_map),
                position: new am.Vector({x: 205, y: 205}),
                transformable: t.createTransformable(null, null, null)
            })
        ],
        map = new alien.Map({
            tile_width: 20,
            tile_height: 20,
            tileset: {
                //tilesheet: "img/tileset.png",
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
            background: "rgba(255,255,255,1)",
            tilemap: {
                "_": 'GROUND',
                "#": 'WALL'
            },
            mapdata: [
                "######################################################################",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#                                                                    #",
                "#____________________________________________________________________#"
            ]
        }),
        s = new alien.Scene(null, map, e);
    game.addScene(s).loadScene(s.id);
    game.run();

    window.game = game;

    window.alien = alien;
});

require.config({
    paths: {
        underscore: "../vendor/underscore.min",
        alien: "../alien"
    }
});
