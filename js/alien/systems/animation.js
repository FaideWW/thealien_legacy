/**
 * Created by faide on 2014-05-01.
 */
define(['underscore', 'alien/systems/messaging', 'alien/logging'], function (_, Messaging, Log) {
    "use strict";
    var synchronized_animations = [];
    return {
        id: "__ANIMATION",
        init: function (scene) {
            var animated = scene.getAllWith('animatable');
            _.each(animated, function (entity) {
                var current_animation =  entity.animatable.animations[entity.animatable.activeAnimation];
                if (!entity.renderable) {
                    entity.renderable = current_animation.frames[current_animation.currentFrame];
                }
            });
        },
        step: function (scene, dt) {
            var animated = scene.getAllWith('animatable');
            /* Fetch messages */
            Messaging.fetch('animation');
            _.each(animated, function (entity) {
                /*
                Determine active animation.
                Filter the animation set by each animation's predicate, sort by their priority and pluck the last element,
                 */
                var active    = _.last(_.sortBy(_.filter(entity.animatable.animations, function (animation) {
                    return animation.predicate.call(entity, scene);
                }), function (anim) {
                    return anim.priority;
                })),
                    animation = entity.animatable.animations[entity.animatable.activeAnimation],
                    frametime = ('function' === typeof animation.framerate) ? 1000 / animation.framerate.call(entity, dt) : 1000 / animation.framerate,
                    new_animation = false;
                if (!active) {
                    this.setAnimation(entity, entity.animatable.defaultAnimation);
                    animation = entity.animatable.animations[entity.animatable.activeAnimation]
                    new_animation = true;
                } else if (active !== animation) {
                    this.setAnimation(entity, active.id);

                    animation = entity.animatable.animations[entity.animatable.activeAnimation]
                    new_animation = true;
                } else {
                    animation.timeSince += dt;
                }
                if (animation.timeSince >= frametime || new_animation) {
                    /* Switch to next frame */
                    animation.currentFrame = (animation.loops) ? (animation.currentFrame + 1) % animation.frames.length
                                                               : Math.min(animation.currentFrame + 1, animation.frames.length - 1);
                    animation.timeSince %= frametime;
                    entity.renderable = animation.frames[animation.currentFrame];
                }
            }, this);
        },
        setAnimation: function (entity, animation_id) {
            var current_anim,
                next_anim,
                resetAnimation = function (animation_id) {
                    if (this.animatable) {
                        this.animatable.animations[animation_id].currentFrame = 0;
                    }
                };
            if (entity.animatable) {
                current_anim = entity.animatable.animations[entity.animatable.activeAnimation];
                next_anim    = entity.animatable.animations[animation_id];
                if (current_anim.id !== animation_id) {
                    /* Reset the currently active animation */
                    if (!(current_anim.synchronized && next_anim.synchronized)) {
                        _.each(synchronized_animations, resetAnimation, entity);
                        synchronized_animations = [];
                    } else {
                        next_anim.currentFrame = current_anim.currentFrame;
                    }
                    synchronized_animations.push(current_anim.id, animation_id);
                    entity.animatable.activeAnimation = animation_id;
                }
            }
        }
    };
});

/**

 _.each(scene.entities, function (entity) {
                if (!entity.renderable) {
                    entity.renderable = entity.animatable.animations[entity.animatable.activeAnimation].frames[entity.animatable.currentFrame];
                }
            });

*/