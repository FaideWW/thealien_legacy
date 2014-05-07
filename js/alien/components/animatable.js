/**
 * Created by faide on 2014-05-01.
 */
define(['underscore', 'alien/components/renderable'], function (_, RenderableFactory) {
    "use strict";
    var AnimationFactory = (function () {
        return {
            createAnimationSet: function (spritesheet, animations, default_animation) {
                var animation_set = {
                    activeAnimation: default_animation,
                    defaultAnimation: default_animation,
                    animations: {}
                };
                _.each(animations, function (animation, animation_id) {
                    animation_set.animations[animation_id] = this.createAnimation(animation_id, spritesheet, animation.frames,
                                                                                  animation.predicate, animation.options);
                }, this);
                return animation_set;
            },
            /**
             * Creates an animation object that represents a state in the animation state machine for this entity.
             *
             * The state_predicate is a function that will return true when the animation is meant to play.  When
             *  multiple states return true, the animation with the highest priority will be played.  When animations
             *  have equally high priorities, alphabetical order will serve as priority.
             *
             * @param spritesheet     : img      - The image data for the animation
             * @param frames          : Array    - A list of coordinates on the spritesheet representing the frames of the animation
             * @param state_predicate : Function - Is invoked within the containing entity's context.  Returns true if the animation should be played, false otherwise.
             * @param framerate       : Number   - The speed the animation should play at, in FPS
             * @param loops           : Boolean  - Whether the animation loops or not
             * @param priority        : Number   - The animation's priority in the state machine
             * @returns {{frames: (Array|*), frametime: number, loops: (*|boolean), currentFrame: number, timeSince: number}}
             */
            createAnimation: function (id, spritesheet, frames, state_predicate, options) {
                return {
                    frames: _.map(frames, function (frame) {
                        return RenderableFactory.createRenderImage(spritesheet, frame.x, frame.y, frame.w, frame.h, frame.rw, frame.rh);
                    }),
                    frametime:    1000 / options.framerate,
                    id:           id,
                    loops:        (options.loops === undefined) ? true : options.loops,
                    predicate:    state_predicate,
                    priority:     options.priority || 0,
                    synchronized: options.synchronized || false,
                    currentFrame: 0,
                    timeSince:    0
                };
            },
            createFrame: function (x, y, w, h, rw, rh) {
                return {
                    x:  x,
                    y:  y,
                    w:  w,
                    h:  h,
                    rw: rw,
                    rh: rh
                };
            }
        };
    }());
    return AnimationFactory;
});