/**
 * Created by faide on 2014-03-10.
 */
define(['./game', './utilities/math', './systems/render', './scene', './entity',
        './components/renderable', './systems/collision', './components/collidable',
        './systems/event', './components/controller', './systems/interface', './components/movable',
        './components/camera', './components/transformable', './systems/physics', './systems/animation',
        './components/animatable', './map', './systems/messaging', './components/message'],
    function (a, b, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u) {
        'use strict';
        return {
            systems: {
                Render:    d,
                Collider:  h,
                Event:     j,
                Interface: l,
                Messaging: t,
                Physics:   p,
                Animation: q
            },
            components: {
                RenderableFactory:    g,
                CollidableFactory:    i,
                ControllerFactory:    k,
                MovableFactory:       m,
                CameraFactory:        n,
                TransformableFactory: o,
                AnimationFactory:     r,
                Message:              u
            },
            utilities: {
                Math: b
            },
            Game:   a,
            Map:    s,
            Scene:  e,
            Entity: f
        };
    });