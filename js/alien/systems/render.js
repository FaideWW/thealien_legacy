/**
 * Created by faide on 2014-04-11.
 *
 * Note: All coordinates (save polygons) used in rendering are converted to integers via bitwise OR hackery (slightly faster Math.floor),
 *       to avoid subpixel rendering
 *
 * TODO: Entity being followed by the camera jitters around the center of the viewport; ensure that
 */
define(["underscore", "alien/logging", "alien/systems/messaging"], function (_, Log, Messaging) {
    'use strict';

    var default_ctx,
        ctx_width,
        ctx_height,
        Render = {
            id: "__RENDER",
            init: function (context, width, height) {
                default_ctx = context;
                ctx_width = width || context.canvas.width;
                ctx_height = height || context.canvas.height;
                default_ctx.mozImageSmoothingEnabled    = false;
                default_ctx.oImageSmoothingEnabled      = false;
                default_ctx.webkitImageSmoothingEnabled = false;
                default_ctx.imageSmoothingEnabled       = false;
            },
            step: function (scene, dt) {
                /* Fetch messages */
                //Messaging.fetch('render');
                var renderables = scene.getAllWithAllOf(['renderable', 'position']),
                    camera      = scene.getAllWithAllOf(['camera', 'position'])[0];

                default_ctx.clearRect(0, 0, ctx_width, ctx_height);
                /* If there's more than one entity with a camera, choose the first one in the list */

                /* Draw the map background */
                default_ctx.save();
                default_ctx.fillStyle = scene.map.background;
                default_ctx.fillRect(0, 0, ctx_width, ctx_height);
                default_ctx.restore();
                this.drawCamera(camera, scene.map, renderables);
            },
            drawMap: function (map) {
                _.each(map.mapdata, function (row, y) {
                    _.each(row, function (tile, x) {
                        var tile_pos;
                        if (tile) {
                            tile_pos = {
                                x: (x * map.tile_width) + (map.tile_width / 2),
                                y: (y * map.tile_height) + (map.tile_height / 2)
                            };
                            Render.methods[map.tileset[tile].method](default_ctx, tile_pos, map.tileset[tile]);
                        }
                    });
                });
            },
            /**
             * Accepts a camera object, and a list of renderable objects with a polygon (offset to a position),
             *  a color and fill style and a reference to the preferred rendering method for each.
             *
             * This method will only draw what is contained in the camera's view window, and
             *  output only to the camera object's designated output window
             *
             * @param camera_entity
             * @param renderables
             */
            drawCamera: function (camera_entity, map, renderables) {
                var cam_pos, cam_scale_x, cam_scale_y, cam_space_x, cam_space_y;
                /* clear the entire canvas (might be some performance increase in tracking changed regions */
                default_ctx.save();
                cam_pos = camera_entity.camera.position || camera_entity.position;//.add(camera_entity.camera.position_offset);
                /* Transform to camera-space */
                cam_scale_x = camera_entity.camera.output.half_width  / camera_entity.camera.view.half_width;
                cam_scale_y = camera_entity.camera.output.half_height / camera_entity.camera.view.half_height;
                cam_space_x = ((camera_entity.camera.output.half_width  / 2) - cam_pos.x);
                cam_space_y = ((camera_entity.camera.output.half_height / 2) - cam_pos.y);

                default_ctx.scale(cam_scale_x, cam_scale_y);

                default_ctx.translate(cam_space_x, cam_space_y);

                /* Draw the map first */
                Render.drawMap(map);


                _.each(renderables, function (r) {
                    /* each renderable has a "preferred" rendering method */
                    default_ctx.save();
                    if (r.transformable) {
                        default_ctx.translate(r.position.x, r.position.y);
                        default_ctx.translate(r.transformable.translate.x, r.transformable.translate.y);
                        default_ctx.scale(r.transformable.scale.x, r.transformable.scale.y);
                        default_ctx.rotate(r.transformable.rotate);
                        default_ctx.translate(-r.position.x, -r.position.y);
                    }
                    Render.methods[r.renderable.method](default_ctx, r.position, r.renderable);
                    default_ctx.restore();
                });

                Messaging.fetch('render', this);
                default_ctx.restore();
            },
            draw: function (position, renderable) {
                default_ctx.save();
                Render.methods[renderable.method](default_ctx, position, renderable);
                default_ctx.restore();
            },
            /**
             * Each render method accepts three parameters:
             * ctx  - the rendering context
             * pos  - the position to begin drawing at
             * r    - a method-specific object/list that defines the shape of the object to be drawn
             *
             */
            methods: {
                /*
                 r - a rectangle object with a width, height, and fill type
                 */
                drawRect: function (ctx, pos, r) {
                    if (!ctx) {
                        ctx = default_ctx;
                    }
                    ctx.translate((pos.x + 0.5) | 0, (pos.y + 0.5) | 0);
                    if (r.stroke) {
                        ctx.strokeStyle = r.stroke;
                    }
                    if (r.fill) {
                        ctx.fillStyle = r.fill;
                    }
                    ctx.beginPath();
                    ctx.rect((-r.w / 2), (-r.h / 2), r.w, r.h);
                    if (r.stroke) {
                        ctx.stroke();
                    }
                    if (r.fill) {
                        ctx.fill();
                    }
                },
                /*
                 r - a sequential list of points {x,y} to define a polygon
                 */
                drawPolygon: function (ctx, pos, r) {
                    var poly = r.poly,
                        i,
                        points = poly.getPoints(),
                        l = points.length;
                    if (!ctx) {
                        ctx = default_ctx;
                    }
                    if (r.stroke) {
                        ctx.strokeStyle = r.stroke;
                    }
                    if (r.fill) {
                        ctx.fillStyle = r.fill;
                    }
                    ctx.beginPath();
                    /* In order to preserve shape, polygons are not rounded */
                    ctx.moveTo((pos.x + points[0].x), (pos.y + points[0].y));
                    for (i = 1; i < l; i += 1) {
                        ctx.lineTo((pos.x + points[i].x), (pos.y + points[i].y));
                    }
                    ctx.closePath();
                    if (r.fill) {
                        ctx.fill();
                    }
                    if (r.stroke) {
                        ctx.stroke();
                    }
                },
                /*
                 r - the end segment of the line
                 */
                drawLine: function (ctx, pos, r) {
                    if (!ctx) {
                        ctx = default_ctx;
                    }
                    ctx.strokeStyle = r.stroke;
                    ctx.moveTo((pos.x + 0.5) | 0, (pos.y + 0.5) | 0);
                    ctx.lineTo((r.x + 0.5) | 0, (r.y + 0.5) | 0);
                    ctx.stroke();
                },
                drawCircle: function (ctx, pos, r) {
                    if (!ctx) {
                        ctx = default_ctx;
                    }
                    if (r.stroke) {
                        ctx.strokeStyle = r.stroke;
                    }
                    if (r.fill) {
                        ctx.fillStyle = r.fill;
                    }
                    ctx.beginPath();
                    ctx.arc((pos.x + 0.5) | 0, (pos.y + 0.5) | 0, r.radius, 0, Math.PI * 2, false);
                    ctx.closePath();
                    if (r.fill) {
                        ctx.fill();
                    }
                    if (r.stroke) {
                        ctx.stroke();
                    }
                },
                drawImage: function (ctx, pos, r) {
                    if (r.spritesheet.ready) {
                        /* all values from the renderable are floored during initialization */
                        ctx.drawImage(r.spritesheet.image, r.x, r.y, r.width, r.height,
                                     (pos.x - r.r_width / 2), (pos.y - r.r_height / 2), r.r_width, r.r_height);
                    }
                }
            }
        };

    return Render;
});