/**
 * Created by faide on 2014-04-11.
 */
define(['alien/systems/render'], function (Render) {
    'use strict';
    var imageCache = {};
    var RenderableFactory = (function () {
        return {
            createRenderRectangle: function (w, h, strokeStyle, fillStyle) {
                return {
                    method: 'drawRect',
                    w:      (w + 0.5) | 0,
                    h:      (h + 0.5) | 0,
                    stroke: strokeStyle, //optional, will be ignored during rendering if undefined
                    fill:   fillStyle    //optional, will be ignored during rendering if undefined
                };
            },
            createRenderPolygon: function (polygon, strokeStyle, fillStyle) {
                return {
                    method: 'drawPolygon',
                    poly:   polygon,
                    stroke: strokeStyle, //optional, will be ignored during rendering if undefined
                    fill:   fillStyle    //optional, will be ignored during rendering if undefined
                };
            },
            createRenderCircle: function (radius, strokeStyle, fillStyle) {
                return {
                    method: 'drawCircle',
                    radius: (radius + 0.5) | 0,
                    stroke: strokeStyle, //optional, will be ignored during rendering if undefined
                    fill:   fillStyle    //optional, will be ignored during rendering if undefined
                };
            },
            createRenderImage: function (spritesheet, x, y, width, height, r_width, r_height) {
                var renderable = {
                    method: 'drawImage',
                    spritesheet: imageCache[spritesheet],
                    x:           (x + 0.5) | 0,
                    y:           (y + 0.5) | 0,
                    width:       (width + 0.5) | 0,
                    height:      (height + 0.5) | 0,
                    r_width:     ((r_width + 0.5) | 0) || ((width + 0.5) | 0),
                    r_height:    ((r_height + 0.5) | 0) || ((height + 0.5) | 0),
                    ready:       false
                };
                if (imageCache.hasOwnProperty(spritesheet)) {
                    renderable.ready = true;
                } else {
                    imageCache[spritesheet] = new Image();
                    imageCache[spritesheet].src = spritesheet;
                    imageCache[spritesheet].onload = function () {
                        console.log('img ' + spritesheet + ' ready');
                        renderable.spritesheet = imageCache[spritesheet];
                        renderable.ready = true;
                    };
                }
                return renderable;
            }
        };
    }());

    return RenderableFactory;
});