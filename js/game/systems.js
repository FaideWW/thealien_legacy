/**
 * Created by faide on 2014-09-05.
 */

// TODO: resolve bullet-through-paper effect at high ball velocities
// TODO: in the future, implement system indexing or some priority sorting


'use strict';

define(['core/math'], function (math) {
    return function (game) {
        /*
         Order is imperative here; systems are sorted within their loopphases in the order they are declared

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

                entity.velocity = math.sub(position, last_pos);

            }, this.__lock, this);
        }, {
            range: null
        });

        // Start Screen
        game.defineSystem('input', function (flags) {
            return flags.renderable | flags.position | flags.listener | flags.collidable;
        }, function (scene) {
            // poll input
            scene.each(function () {
                if (scene.input.mouse) {
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
                    entity.velocity = math.add(velocity, collidable.collision_data.velocity);
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
                    entity.position = math.add(position, math.mul(velocity, dt / 1000));
//                    position.x += velocity.x * (dt / 1000);
//                    position.y += velocity.y * (dt / 1000);

                    if (entity.acceleration) {
                        entity.velocity = math.add(velocity, math.mul(entity.acceleration, dt / 1000));
//                        velocity.x += entity.acceleration.x * (dt / 1000);
//                        velocity.y += entity.acceleration.y * (dt / 1000);

//                        entity.acceleration = math.mul(entity.acceleration, 0.99);
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
                    entity.position = math.add(entity.position, vector);
                }
            },
            accelerate: function (entity, accel, abs) {
                if (!(entity.controller) && (entity.acceleration)) {
                    if (abs) {
                        entity.acceleration = math.vec2();
                    }

                    entity.acceleration = math.add(entity.acceleration, accel);
                }
            },
            spin: function (entity, angular_v, dir) {
                if (!(entity.controller) && (entity.spin)) {
                    entity.spin.angular_v *= 0.5;
                    entity.spin.angular_v += (angular_v * dir);
                }
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

                    // we want a value copy, not a reference copy
                    world_pos = math.vec2(position);

                    if (translation) {
                        world_pos = math.add(world_pos, translation);
                    }
//                    world_pos = {
//                        x: position.x + ((translation) ? translation.x : 0),
//                        y: position.y + ((translation) ? translation.y : 0)
//                    };

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

                    // we want a value copy, not a reference copy
                    world_pos = math.vec2(position);

                    if (translation) {
                        world_pos = math.add(world_pos, translation);
                    }

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