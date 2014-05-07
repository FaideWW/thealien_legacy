/**
 * Created by faide on 2014-05-01.
 */
define(['underscore', 'alien/systems/messaging'], function (_, Messaging) {
    "use strict";
    return {
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
            /* Fetch messages */
            Messaging.fetch('animation');
            var animated = scene.getAllWith('animatable');
            _.each(animated, function (entity) {
                /*
                Determine active animation.
                Filter the animation set by each animation's predicate, sort by their priority and pluck the last element,
                 */
                var active    = _.last(_.sortBy(_.filter(entity.animatable.animations, function (animation) {
                        //debugger;
                    return animation.predicate.call(entity, scene);
                }), function (anim) {
                    return anim.priority;
                })),
                    animation = entity.animatable.animations[entity.animatable.activeAnimation];
                if (!active) {
                    this.setAnimation(entity, entity.animatable.defaultAnimation);
                } else if (active !== animation) {
                    this.setAnimation(entity, active.id);
                }
                animation.timeSince += dt;
                if (animation.timeSince >= animation.frametime) {
                    /* Switch to next frame */
                    animation.currentFrame = (animation.loops) ? (animation.currentFrame + 1) % animation.frames.length
                                                               : Math.min(animation.currentFrame + 1, animation.frames.length - 1);
                    animation.timeSince = animation.timeSince % animation.frametime;
                    entity.renderable = animation.frames[animation.currentFrame];
                }
            }, this);
        },
        setAnimation: function (entity, animation_id) {
            if (entity.animatable) {
                /* Reset the currently active animation */
                if (!(entity.animatable.animations[entity.animatable.activeAnimation].synchronized
                    && entity.animatable.animations[animation_id].synchronized)) {
                    entity.animatable.animations[entity.animatable.activeAnimation].currentFrame = 0;
                }
                entity.animatable.activeAnimation = animation_id;
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