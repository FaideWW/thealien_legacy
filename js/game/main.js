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
        speed   = 75,
        attack_framerate = 14,
        key_map = [
            cn.createKeyBinding('w', function (event, mod) {
                /* up keydown */
                if (this.movable.jump < 1) {
                    this.movable.jumping = true;
                    this.movable.onGround = false;
                    this.movable.velocity.y = -200;
                    this.movable.jump += 1;
                }
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
//                if ((mod[16] && this.movable.velocity.x !== 0) || this.sliding) {
//                    this.movable.sliding = true;
//                }
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
            cn.createKeyBinding('j', function (event, mod) {
                // punch keydown
                if (this.movable.onGround && !this.movable.crouching && !this.movable.attacking) {
                    this.movable.attacking = true;
                    window.setTimeout((function () {
                        this.movable.attacking = false;
                    }).bind(this), (1000 / attack_framerate) * 9);
                }
            }, function () {
//                this.movable.attacking = false;
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
        player_animations = an.createAnimationSet("img/spritesheet.png", {
            idle_right: {
                frames: [
                    an.createFrame(0, 4, 24-0, 29-4),
                    an.createFrame(30, 4, 54-30, 29-4)
                ],
                predicate: function () {
                    return (this.movable.onGround && this.movable.facingRight && this.movable.velocity.x === 0 && !this.movable.crouching);
                },
                options: {
                    framerate: 2
                }
            },
            idle_left: {
                frames: [
                    an.createFrame(65, 4, 89-65, 29-4),
                    an.createFrame(95, 4, 119-95, 29-4)
                ],
                predicate: function () {
                    return (this.movable.onGround && this.movable.facingLeft && this.movable.velocity.x === 0 && !this.movable.crouching);
                },
                options: {
                    framerate: 2
                }
            },
            crouch_right: {
                frames: [
                    an.createFrame(0, 36, 21-0, 59-36),
                    an.createFrame(30, 36, 53-30, 61-36)
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
            crouch_left: {
                frames: [
                    an.createFrame(98, 35, 119-98, 59-35),
                    an.createFrame(68, 35, 91-68, 60-35)
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
            air_up_right: {
                frames: [
                    an.createFrame(0, 63, 17-0, 89-63),
                    an.createFrame(30, 63, 49-30, 89-63)
                ],
                predicate: function () {
                    return (!this.movable.onGround && (this.movable.facingRight && (this.movable.jumping && this.movable.velocity.y < 0)));
                },
                options: {
                    framerate: framerate,
                    loops: false
                }
            },
            air_up_left: {
                frames: [
                    an.createFrame(222, 93, 239-222, 119-93),
                    an.createFrame(192, 95, 209-192, 119-95)
                ],
                predicate: function () {
                    return (!this.movable.onGround && (this.movable.facingLeft && (this.movable.jumping && this.movable.velocity.y < 0)));
                },
                options: {
                    framerate: framerate,
                    loops: false
                }
            },
            air_flip_right: {
                frames: [
                    an.createFrame(60, 66, 79-60, 90-66)
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
            air_flip_left: {
                frames: [
                    an.createFrame(160, 96, 179-160, 119-96)
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
            air_down_right: {
                frames: [
                    an.createFrame(90, 62, 106-90, 89-62)
                ],
                predicate: function () {
                    return (!this.movable.onGround && (this.movable.facingRight && (!this.movable.jumping && this.movable.velocity.y > 0)));
                },
                options: {
                    loops: false,
                    framerate: framerate
                }
            },
            air_down_left: {
                frames: [
                    an.createFrame(133, 92, 149-133, 119-92)
                ],
                predicate: function () {
                    return (!this.movable.onGround && (this.movable.facingLeft && (!this.movable.jumping && this.movable.velocity.y > 0)));
                },
                options: {
                    loops: false,
                    framerate: framerate
                }
            },
            land_right: {
                frames: [
                    an.createFrame(120, 69, 139-120, 89-67),
                    an.createFrame(150, 65, 172-150, 89-65),
                    an.createFrame(180, 65, 209-180, 89-65),
                    an.createFrame(212, 63, 228-212, 89-63)
                ],
                predicate: function () {
                    // TODO: implement this
                    return false;
                    //return (!this.movable.onGround && (this.movable.facingRight && (!this.movable.jumping && this.movable.velocity.y > 0)));
                },
                options: {
                    loops: false,
                    framerate: framerate
                }
            },
            land_left: {
                frames: [
                    an.createFrame(100, 97, 119-19, 119-97),
                    an.createFrame(67, 95, 89-67, 119-95),
                    an.createFrame(30, 94, 59-30, 119-94),
                    an.createFrame(13, 93, 29-13, 119-93)
                ],
                predicate: function () {
                    // TODO: implement this
                    return false;
                    //return (!this.movable.onGround && (this.movable.facingRight && (!this.movable.jumping && this.movable.velocity.y > 0)));
                },
                options: {
                    loops: false,
                    framerate: framerate
                }
            },

            attack_right: {
                frames: [
                    an.createFrame(1, 123, 23-1, 149-123),
                    an.createFrame(30, 122, 64-30, 149-122),
                    an.createFrame(65, 122, 98-65, 149-122),
                    an.createFrame(100, 122, 132-100, 149-122),
                    an.createFrame(135, 121, 159-135, 149-121),
                    an.createFrame(170, 122, 204-170, 149-122),
                    an.createFrame(205, 123, 242-205, 149-123),
                    an.createFrame(240, 123, 277-240, 149-123),
                    an.createFrame(275, 123, 300-275, 148-123)
                ],
                predicate: function () {
                    return this.movable.attacking && this.movable.facingRight;
                },
                options: {
                    loops: false,
                    framerate: attack_framerate
                }
            },
            attack_left: {
                frames: [
                    an.createFrame(283, 154, 305-283, 179-154),
                    an.createFrame(235, 153, 270-235, 180-153),
                    an.createFrame(202, 153, 235-202, 180-153),
                    an.createFrame(168, 153, 200-168, 180-153),
                    an.createFrame(141, 153, 165-141, 180-153),
                    an.createFrame(96, 153, 130-96, 180-153),
                    an.createFrame(61, 153, 95-61, 180-153),
                    an.createFrame(26, 153, 60-26, 180-153),
                    an.createFrame(0, 154, 25-0, 180-154)
                ],
                predicate: function () {
                    return this.movable.attacking && this.movable.facingLeft;
                },
                options: {
                    loops: false,
                    framerate: attack_framerate
                }
            },
            walk_right: {
                frames: [
                    an.createFrame(0, 186,   24-0, 213-186),
                    an.createFrame(30, 187,  50-30, 213-187),
                    an.createFrame(60, 185,  80-60, 213-185),
                    an.createFrame(90, 184,  108-90, 213-184),
                    an.createFrame(120, 185, 146-120, 213-185),
                    an.createFrame(150, 187, 171-150, 213-187),
                    an.createFrame(180, 184, 200-180, 213-184),
                    an.createFrame(210, 183, 232-210, 213-183)
                ],
                predicate: function () {
                    return this.movable.onGround && (this.movable.facingRight && (this.movable.velocity.x > 0 && !this.movable.running));
                },
                options: {
                    framerate: function (dt) {
                        return (Math.abs(this.movable.velocity.x) / speed * framerate) / 2;
                    },
                    loops: true
                }
            },
            walk_left: {
                frames: [
                    an.createFrame(208, 217, 229-208, 244-217),
                    an.createFrame(182, 218, 199-182, 244-218),
                    an.createFrame(152, 216, 169-152, 244-216),
                    an.createFrame(124, 215, 139-124, 244-215),
                    an.createFrame(86, 216, 109-86, 244-216),
                    an.createFrame(61, 218, 79-61, 244-218),
                    an.createFrame(32, 215, 49-32, 244-215),
                    an.createFrame(0, 214, 19-0, 244-214)
                ],
                predicate: function () {
                    return this.movable.onGround && (this.movable.facingLeft && (this.movable.velocity.x < 0 && !this.movable.running));
                },
                options: {
                    framerate: function () {
                        return (Math.abs(this.movable.velocity.x) / speed * framerate) / 2;
                    },
                    loops: true
                }
            },
            run_right: {
                frames: [
                    an.createFrame(0, 246, 29-0, 273-246),
                    an.createFrame(35, 247, 59-35, 273-247),
                    an.createFrame(70, 245, 92-70, 273-245),
                    an.createFrame(105, 245, 128-105, 273-245),
                    an.createFrame(140, 246, 163-140, 273-246),
                    an.createFrame(175, 248, 201-175, 273-248),
                    an.createFrame(210, 245, 238-210, 273-245),
                    an.createFrame(245, 247, 268-245, 273-247),
                    an.createFrame(280, 245, 302-280, 273-245),
                    an.createFrame(315, 245, 338-315, 273-245),
                    an.createFrame(350, 247, 371-350, 273-247),
                    an.createFrame(385, 248, 409-385, 273-248)
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
            run_left: {
                frames: [
                    an.createFrame(380, 275, 409-380, 302-275),
                    an.createFrame(350, 276, 374-350, 302-276),
                    an.createFrame(320, 274, 339-320, 302-274),
                    an.createFrame(284, 274, 304-284, 302-274),
                    an.createFrame(246, 275, 269-246, 302-275),
                    an.createFrame(208, 277, 234-208, 302-277),
                    an.createFrame(171, 274, 199-171, 302-274),
                    an.createFrame(110, 274, 129-110, 302-274),
                    an.createFrame(74, 274, 94-74, 302-274),
                    an.createFrame(41, 276, 59-41, 302-276),
                    an.createFrame(0, 277, 24-0, 302-277)
                ],
                predicate: function () {
                    return this.movable.onGround && (this.movable.facingLeft && (this.movable.velocity.x < 0 && this.movable.running));
                },
                options: {
                    framerate: framerate,
                    priority: 1,
                    loops: true
                }
            }
        }, "idle_right"),

        _makeplatform = function (x1,y1,x2,y2) {
            var hw = (x2 - x1) / 2,
                hh = (y2 - y1) / 2;
            return {
                collidable: cl.createAABB(hw, hh),
                position:   new am.Vector({
                    x: x1 + hw,
                    y: y1 + hh
                }),
                movable: m.createMovable(false),
                isStatic: true
            };
        },

        e = [
            // map
            new alien.Entity({
                position: new am.Vector({
                    x: 252,
                    y: 140
                }),
                renderable: r.createRenderImage("img/level.png", 0, 0, 504, 281)
            }),
            new alien.Entity({
                id: "player",
                animatable: player_animations,
                camera: cm.createCamera(canvas.width / 2, canvas.height / 2, canvas.width / 4, canvas.height / 4, canvas.height / 4, false,
                        canvas.width / 4, canvas.height / 4, 372, 281 - canvas.height / 4),
                collidable: cl.createAABB(13, 13),
                movable: m.createMovable(true),
                keylistener: cn.createKeyListener(key_map),
                mouselistener: cn.createMouseListener(mouse_map),
                position: new am.Vector({x: 205, y: 205}),
                transformable: t.createTransformable(null, null, null)
            }),
            // map collidables
            new alien.Entity(_makeplatform(0, 235, 34, 280)),
            new alien.Entity(_makeplatform(35, 209, 120, 279)),
            new alien.Entity(_makeplatform(118, 186, 203, 256)),
            new alien.Entity(_makeplatform(193, 145, 256, 194)),
            new alien.Entity(_makeplatform(320, 190, 424, 278)),
            new alien.Entity(_makeplatform(425, 176, 239, 195)),
            new alien.Entity(_makeplatform(440, 148, 503, 192)),
            // scene bounds
            new alien.Entity({
                collidable: cl.createAABB(50, 300),
                movable: m.createMovable(false),
                position: new am.Vector({
                    x: -50,
                    y: 0
                }),
                isStatic: true
            }),
            new alien.Entity({
                collidable: cl.createAABB(50, 300),
                movable: m.createMovable(false),
                position: new am.Vector({
                    x: 504 + 50,
                    y: 0
                }),
                isStatic: true
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
            background: "rgba(0,0,0,1)",
            tilemap: {
                "_": 'GROUND',
                "#": 'WALL'
            },
            player_spawn: 'p',
            slopetile: '-',
            mapdata: [
                "p"
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


game.run();