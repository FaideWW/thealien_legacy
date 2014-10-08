/**
 * Created by faide on 2014-09-05.
 */

// TODO: resolve bullet-through-paper effect at high ball velocities


'use strict';

define(['core/math'], function (math) {
    return function (game) {
        /*
            Order is imperative here; systems are sorted within their loopphases in the order they are declared

            TODO: in the future, implement system indexing or some priority sorting
         */

        // Paddle Control
        game.defineSystem("input", function (flags) {
            return flags.controller | flags.position | flags.velocity;
        }, function (scene, dt) {
            scene.each(function (entity) {
                var controller = entity.controller,
                    position = entity.position,
                    velocity = entity.velocity,
                    mouse = {
                        x: scene.input.mouseX,
                        y: scene.input.mouseY
                    },
                    adjusted_range = null,
                    last_pos = {
                        x: position.x,
                        y: position.y
                    };

                if (!this.range && scene.renderTarget) {
                    this.range = {
                        x: {
                            min: 50,
                            max: scene.renderTarget.canvas.width - 50
                        },
                        y: {
                            min: 50,
                            max: scene.renderTarget.canvas.height - 50
                        }
                    };
                }

                if (this.range) {

                    if (entity.renderable) {
                        adjusted_range = {
                            x: {
                                min: this.range.x.min + entity.renderable.half_width,
                                max: this.range.x.max - entity.renderable.half_width
                            },
                            y: {
                                min: this.range.y.min + entity.renderable.half_height,
                                max: this.range.y.max - entity.renderable.half_height
                            }
                        };
                    }

                    // clamp the paddles to within the defined boundaries
                    position[controller.direction] = Math.max(
                        Math.min(
                            adjusted_range[controller.direction].max,
                            mouse[controller.direction]),
                        adjusted_range[controller.direction].min
                    );
                } else {
                    position[controller.direction] = mouse[controller.direction];
                }

                velocity.x = (position.x - last_pos.x);
                velocity.y = (position.y - last_pos.y);

            }, this.__lock, this);
        }, {
            range: null
        });

        // Start Screen
        game.defineSystem('input', function (flags) {
            return flags.renderable | flags.position | flags.listener | flags.collidable;
        }, function (scene, dt) {
            // poll input
            scene.each(function () {
                if (scene.input.mouse) {
                    console.log('go next');
                    scene.goTo('play');
                }
            }, this.__lock)
        });

        // Bounce
        game.defineSystem("physics", function (flags) {
            return flags.collidable | flags.velocity;
        }, function (scene) {
            scene.each(function (entity) {
                var collidable = entity.collidable,
                    velocity = entity.velocity;

                if ((collidable.collidedX || collidable.collidedY) && collidable.reaction === "bounce") {
                    if (math.dot(collidable.manifold, math.unt(velocity)) < 0) {
                        if (collidable.collidedX) {
                            velocity.x *= -1.1;
                            collidable.collidedX = false;
                        }

                        if (collidable.collidedY) {
                            // determine if the collision is already being resolved
                            velocity.y *= -1.1;
                            collidable.collidedY = false;
                        }

                    }
                }
            }, this.__lock, this);
        });

        // Impulse
        game.defineSystem("physics", function (flags) {
            return flags.collidable | flags.velocity;
        }, function (scene) {
            scene.each(function (entity) {
                var collidable = entity.collidable,
                    velocity = entity.velocity;


                if ((collidable.collidedX || collidable.collidedY) && collidable.collision_data.velocity) {
                    velocity.x += collidable.collision_data.velocity.x;
                    velocity.y += collidable.collision_data.velocity.y;
                }
            }, this.__lock, this);
        });

        // Physics
        game.defineSystem("physics", function (flags) {
            return flags.position | flags.velocity;
        }, function (scene, dt) {
            // digest messages
            scene.msg.resolve('physics', this);

            // process entities
            scene.each(function (entity) {
                var position = entity.position,
                    velocity = entity.velocity;

                if (!(entity.controller)) {
                    position.x += velocity.x * (dt / 1000);
                    position.y += velocity.y * (dt / 1000);

                    if (entity.acceleration) {
                        velocity.x += entity.acceleration.x * (dt / 1000);
                        velocity.y += entity.acceleration.y * (dt / 1000);

//                                entity.components[_flags.acceleration].y *= 0.99;
//                                entity.components[_flags.acceleration].x *= 0.99;
                    }

                    if (entity.spin && entity.rotation) {
                        entity.rotation.angle += entity.spin.angular_v * (dt / 1000);
                        // drag
                        entity.spin.angular_v *= 0.99;
                    }
                }

            }, this.__lock, this);
        }, {
            shift: function (entity, vector) {
                // if the entity is being controlled, don't shift it
                if (!(entity.controller)) {
                    entity.position.x += vector.x;
                    entity.position.y += vector.y;
                }
            },
            accelerate: function (entity, accel, abs) {
                if (!(entity.controller) && (entity.acceleration)) {
                    if (abs) {
                        entity.acceleration.x = 0;
                        entity.acceleration.y = 0;
                    }
                    entity.acceleration.x += accel.x;
                    entity.acceleration.y += accel.y;
                }
            },
            spin: function (entity, angular_v, dir) {
                if (!(entity.controller) && (entity.spin)) {
                    entity.spin.angular_v *= 0.5;
                    entity.spin.angular_v += (angular_v * dir);
                }
            }
        });

        // Collision Detection
        game.defineSystem("collision", function (flags) {
            return flags.position | flags.collidable;
        }, function (scene) {
            scene.pairs(function (entity1, entity2) {
                var position1 =          entity1.position,
                    position2 =          entity2.position,
                    collidable1 =        entity1.collidable,
                    collidable2 =        entity2.collidable,
                    collision_manifold;


                if (collidable1.type === "aabb" && collidable2.type === "aabb") {
                    collision_manifold = this.AABBTest(position1, position2, collidable1, collidable2);

                    if (collision_manifold.x > 0 && collision_manifold.y > 0) {
                        if (collision_manifold.x < collision_manifold.y) {
                            if (position1.x < position2.x) {
                                collidable1.manifold = { x: -1, y: 0 };
                                collidable2.manifold = { x: 1, y: 0  };
                                // position1 shifts left, position2 shifts right
                                this.doShift(scene, entity1, { x: -collision_manifold.x, y: 0 });
                                this.doShift(scene, entity2, { x: collision_manifold.x, y: 0 });

                                if (entity1.velocity && entity2.velocity) {
                                    this.applySpin(scene, entity1, {
                                        x: -entity2.velocity.x,
                                        y: -entity2.velocity.y
                                    }, -1);
                                    this.applySpin(scene, entity2, {
                                        x: -entity1.velocity.x,
                                        y: -entity1.velocity.y
                                    }, 1);

                                }



                                collidable1.collidedX = true;
                                collidable2.collidedX = true;

                            } else {
                                collidable1.manifold = { x: 1, y: 0  };
                                collidable2.manifold = { x: -1, y: 0 };
                                // position1 shifts right, position2 shifts left
                                this.doShift(scene, entity1, { x: collision_manifold.x, y: 0 });
                                this.doShift(scene, entity2, { x: -collision_manifold.x, y: 0 });

                                if (entity1.velocity && entity2.velocity) {
                                    this.applySpin(scene, entity1, {
                                        x: -entity2.velocity.x,
                                        y: -entity2.velocity.y
                                    }, 1);
                                    this.applySpin(scene, entity2, {
                                        x: -entity1.velocity.x,
                                        y: -entity1.velocity.y
                                    }, -1);

                                }

                                collidable1.collidedX = true;
                                collidable2.collidedX = true;
                            }
                        } else {
                            if (position1.y < position2.y) {
                                collidable1.manifold = { x: 0, y: -1 };
                                collidable2.manifold = { x: 0, y: 1  };
                                // position1 shifts up, position2 shifts down
                                this.doShift(scene, entity1, { x: 0, y: -collision_manifold.y });
                                this.doShift(scene, entity2, { x: 0, y: collision_manifold.y });

                                if (entity1.velocity && entity2.velocity) {
                                    this.applySpin(scene, entity1, {
                                        x: -entity2.velocity.x,
                                        y: -entity2.velocity.y
                                    }, 1);
                                    this.applySpin(scene, entity2, {
                                        x: -entity1.velocity.x,
                                        y: -entity1.velocity.y
                                    }, -1);

                                }

                                collidable1.collidedY = true;
                                collidable2.collidedY = true;
                            } else {
                                collidable1.manifold = { x: 0, y: 1  };
                                collidable2.manifold = { x: 0, y: -1 };
                                // position1 shifts down, position2 shifts up
                                this.doShift(scene, entity1, { x: 0, y: collision_manifold.y });
                                this.doShift(scene, entity2, { x: 0, y: -collision_manifold.y });

                                if (entity1.velocity && entity2.velocity) {
                                    this.applySpin(scene, entity1, {
                                        x: -entity2.velocity.x,
                                        y: -entity2.velocity.y
                                    }, -1);
                                    this.applySpin(scene, entity2, {
                                        x: -entity1.velocity.x,
                                        y: -entity1.velocity.y
                                    }, 1);

                                }

                                collidable1.collidedY = true;
                                collidable2.collidedY = true;
                            }
                        }
                    }
                }
            }, this.__lock, this);
        }, {
            AABBTest: function (pos1, pos2, aabb1, aabb2) {
                var aabb_sum = {
                        half_width: aabb1.half_width + aabb2.half_width,
                        half_height: aabb1.half_height + aabb2.half_height
                    },
                    relative_pos = {
                        x: pos2.x - pos1.x,
                        y: pos2.y - pos1.y
                    },
                    collision_manifold = {};

                // find closest point and return the difference to it
                if (relative_pos.x < 0) {
                    collision_manifold.x = aabb_sum.half_width + relative_pos.x;
                } else {
                    collision_manifold.x = aabb_sum.half_width - relative_pos.x;
                }

                if (relative_pos.y < 0) {
                    collision_manifold.y = aabb_sum.half_height + relative_pos.y;
                } else {
                    collision_manifold.y = aabb_sum.half_height - relative_pos.y;
                }

                return collision_manifold;

            },
            doShift: function (scene, e, v) {
                scene.msg.enqueue('physics', function () {
                    this.shift(e, v);
                })
            },
            applySpin: function (scene, e, v, dir) {
                var spin_scalar = 5;
                scene.msg.enqueue('physics', function () {
                    var spin_v = (v.x + v.y) * spin_scalar;
                    this.accelerate(e, {
                        x: v.x * spin_scalar,
                        y: v.y * spin_scalar
                    }, true);
                    this.spin(e, spin_v, dir)
                })
            }
        });

        // Boundary
        game.defineSystem("collision", function (flags) {
            return flags.collidable | flags.velocity | flags.position | flags.type;
        }, function (scene, dt) {
            scene.each(function (entity) {
                var collidable = entity.collidable,
                    velocity = entity.velocity,
                    position = entity.position,
                    type = entity.type,

                    minY = collidable.half_height,
                    maxY = scene.renderTarget.canvas.height - collidable.half_height,
                    minX = collidable.half_width,
                    maxX = scene.renderTarget.canvas.width - collidable.half_width,
                    new_angle = 0;

                if (type.type === "ball") {

                    if (position.x < minX || position.x > maxX || position.y < minY || position.y > maxY) {
                        // reset score
                        scene.gameState.points = 0;
                        entity.reset();
                        console.log('resetting');
                        new_angle = Math.random() * Math.PI * 2;
                        velocity.x = Math.cos(new_angle) * scene.gameState.INITIAL_BALL_VELOCITY;
                        velocity.y = Math.sin(new_angle) * scene.gameState.INITIAL_BALL_VELOCITY;
                    } else {
                        scene.gameState.points += dt;

                    }
                }

            }, this.__lock, this);
        });



        // Rendering
        game.defineSystem("render", function (flags) {
            return flags.renderable | flags.position;
        }, function (scene) {
            var render_target = scene.renderTarget;

            if (render_target) {
                render_target.clearRect(0, 0, render_target.canvas.width, render_target.canvas.height);
                render_target.fillStyle = "rgba(0,0,0,1)";
                render_target.fillRect(0, 0, render_target.canvas.width, render_target.canvas.height);
                scene.each(function (entity) {
                    //draw this

                    render_target.save();
                    switch (entity.renderable.type) {
                        case "rect":
                            this.drawRect(entity, render_target);
                            break;
                        case "text":
                            this.drawText(entity, render_target);
                            break;
                        default:
                            break;
                    }
                    render_target.restore();

                }, this.__lock, this);
            } else {
                throw new Error('Scene has no render target')
            }

        }, {
            drawRect: function (entity, render_target) {

                var position = entity.position,
                    renderable = entity.renderable,
                    translation = entity.translation,
                    world_pos;
                if (render_target) {

                    world_pos = {
                        x: position.x + ((translation) ? translation.x : 0),
                        y: position.y + ((translation) ? translation.y : 0)
                    };

                    if (entity.rotation) {
                        render_target.translate(world_pos.x, world_pos.y);
                        render_target.rotate(entity.rotation.angle);
                        render_target.translate(-(world_pos.x), -(world_pos.y));
                    }


                    render_target.translate(world_pos.x, world_pos.y);


                    render_target.fillStyle = renderable.fill;
                    render_target.strokeStyle = renderable.stroke;


                    render_target.beginPath();
                    render_target.rect(-renderable.half_width, -renderable.half_height,
                            renderable.half_width * 2, renderable.half_height * 2);
                    render_target.fill();
                    render_target.stroke();
                }
            },
            drawText: function (entity, render_target) {
                var position = entity.position,
                    renderable = entity.renderable,
                    translation = entity.translation,
                    align_offset = 0,
                    world_pos;

                if (render_target) {
                    world_pos = {
                        x: position.x + ((translation) ? translation.x : 0),
                        y: position.y + ((translation) ? translation.y : 0)
                    };

                    if (entity.rotation) {
                        render_target.translate(world_pos.x, world_pos.y);
                        render_target.rotate(entity.rotation);
                        render_target.translate(-(world_pos.x), -(world_pos.y));
                    }


                    render_target.font = renderable.font;

                    if (renderable.align && renderable.align === "center") {
                        align_offset = render_target.measureText(renderable.text).width / 2;
                    }

                    world_pos.x -= align_offset;

                    render_target.translate(world_pos.x, world_pos.y);


                    if (renderable.fill) {
                        render_target.fillStyle = renderable.fill;
                        render_target.fillText(renderable.text, 0, 0);
                    }

                    if (renderable.stroke) {
                        render_target.strokeStyle = renderable.stroke;
                        render_target.strokeText(renderable.text, 0, 0);
                    }

                }
            }
        });

    };
});