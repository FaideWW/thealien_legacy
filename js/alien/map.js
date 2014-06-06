/**
 * Created by faide on 2014-05-06.
 */
define(['underscore', 'alien/logging', 'alien/components/renderable',
        'alien/components/collidable', 'alien/utilities/math',
        'alien/systems/collision'], function (_, Log, RenderableFactory, CollidableFactory, M, Collision) {
    "use strict";
    var Map = (function () {
        /**
         * @param tileset : Object - Takes the form:
         *  {
         *      tilesheet : String - the path to the image containing the tile sprites
         *      tiles : {
         *          TILE_NAME: {
         *              x: Number,
         *              y: Number,
         *              w: Number,
         *              h: Number
         *          }
         *      }
         *  }
         */
        var createTileset = function (tileset, tw, th) {
                return _.reduce(tileset.tiles, function (renderable_tileset, tile, tilename) {
                    renderable_tileset[tilename] = RenderableFactory.createRenderImage(tileset.tilesheet, tile.x, tile.y, tile.w, tile.h, tw, th);
                    return renderable_tileset;
                }, {});
            },
            generateMapData = function (mapdata, tilemap) {
                return _.map(mapdata, function (row) {
                    return _.map(row.split(''), function (tile) {
                        return tilemap[tile] || ((tile.length && ' ' !== tile[0]) ? tile : null);
                    });
                });
            },
            generateCollisionData = function (map, tw, th, player_spawn_char) {
                return _.map(map, function (row, y) {
                    return _.map(row, function (tile, x) {
                        var t = null;
                        if (tile &&  1 < tile.length) {

                            t = {
                                collidable: CollidableFactory.createAABB(tw / 2, th / 2),
                                position:  new M.Vector({
                                    x: (x * tw) + (tw / 2),
                                    y: (y * th) + (th / 2)
                                }),
                                isStatic: true
                            };
                        }
                        return t;
                    });
                });
            },
            /**
             * The purpose of this method is to reduce the number of collidable surfaces.
             * By default the map will generate a collidable object for every single tile, but typically
             *  a map (especially the ground and walls) will have several adjacent tiles; for every two adjacent tiles,
             *  two collidable faces will never be collided with.
             *
             * In order to prune these excess surfaces, we search for faces which are identical except for their direction.
             *  We can then remove these surfaces.  In the case of solid, square tiles, we can then combine the two
             *  tile's colinear surfaces to create one large two-tile collidable structure.
             *
             * This is repeated until all unnecessary surfaces are removed.  The result should be the smallest subset
             *  of convex collidable polygons that still represents the complete map geometry.
             *
             * @param collidables : Array - A list of collidable/position objects for tiles
             */
            reduceGeometry = function (collidables) {
                var adjacent = function (tile1, tile2) {
                        return (tile1.position.x + tile1.collidable.half_width  === tile2.position.x - tile2.collidable.half_width ||
                                tile1.position.x - tile1.collidable.half_width  === tile2.position.x + tile2.collidable.half_width ||
                                tile1.position.y + tile1.collidable.half_height === tile2.position.y - tile2.collidable.half_height ||
                                tile1.position.y - tile1.collidable.half_height === tile2.position.y + tile2.collidable.half_height);
                    },
                    aabbToPoly = Collision.componentMethods.aabbToPoly,
                    i,
                    j,
                    c1,
                    c2,
                    p1,
                    p2,
                    edge,
                    merged_tile,
                    new_halfwidth,
                    new_halfheight;

                /* Check horizontal adjacents first */
                for (i = 0; i < collidables.length; i += 1) {
                    for (j = i + 1; j < collidables.length; j += 1) {
                        if (adjacent(collidables[i], collidables[j])) {
                            if (collidables[i].collidable.half_width && collidables[j].collidable.half_width) {
                                c1 = collidables[i].collidable;
                                c2 = collidables[j].collidable;
                                p1 = collidables[i].position;
                                p2 = collidables[j].position;
                                edge = aabbToPoly(c1).sharedEdge(aabbToPoly(c2), p2.sub(p1));
                                if (edge) {
                                    new_halfwidth  = (Math.max(p1.x + c1.half_width, p2.x + c2.half_width) - Math.min(p1.x - c1.half_width, p2.x - c2.half_width)) / 2;
                                    new_halfheight = (Math.max(p1.y + c1.half_height, p2.y + c2.half_height) - Math.min(p1.y - c1.half_height, p2.y - c2.half_height)) / 2;
                                    merged_tile    = {
                                        collidable: CollidableFactory.createAABB(
                                            new_halfwidth,
                                            new_halfheight
                                        ),
                                        position: new M.Vector({
                                            x: p1.x - c1.half_width + new_halfwidth,
                                            y: p1.y - c1.half_height + new_halfheight
                                        }),
                                        isStatic: true
                                    };
                                    collidables[j] = null;
                                    collidables[i] = merged_tile;
                                    collidables = _.compact(collidables);
                                    i = 0;
                                    j = 0;
                                }
                            }
                        }
                    }
                }


                return collidables;

                /* Check vertical adjacents next */
            },
            determinePlayerSpawn = function (mapdata, tw, th, player_spawn_char) {
                var c = mapdata.length,
                    y,
                    x;
                for (y = 0; y < c; y += 1) {
                    x = mapdata[y].indexOf(player_spawn_char);
                    if (-1 !== x) {
                        mapdata[y][x] = null;
                        break;
                    }
                }
                return (0 <= x) ? new M.Vector({
                    x: tw * x + tw / 2,
                    y: (th * y + th / 2)
                }) : new M.Vector();
            },
            generateSlopes = function (mapdata, tw, th, slopeTile) {
                // find strings of horizontally adjacent slope tiles
                // procedurally digest tiles until all slopes have been found
                var y,
                    x,
                    row,
                    slopePoly,
                    slopeBottom = -1,
                    slopeTop = -1,
                    slopeHalfWidth,
                    height = mapdata.length,
                    slopes = [];
                for (y = 0; y < height; y += 1) {
                    row = mapdata[y];
                    for (x = 0; x < row.length; x += 1) {
                        if (row[x] === slopeTile) {
                            if (-1 === slopeBottom) {
                                slopeBottom = x;
                                console.group('new slope');
                            }
                            slopeTop = x;
                        } else if (-1 < slopeTop && -1 < slopeBottom) {
                            // extend the slope to the end of the tile
                            slopeTop += 1;
                            // assume the ramp bottom is on the left unless there's a wall directly to the left of the ramp
                            if (0 < slopeBottom && row[slopeBottom - 1]) {
                                console.log(row[slopeBottom - 1]);
                                // XOR swap voodoo
                                slopeBottom ^= slopeTop;
                                slopeTop    ^= slopeBottom;
                                slopeBottom ^= slopeTop;
                            }

                            // the sign is important here; a slope with the bottom on the right will have a negative half-width
                            slopeHalfWidth = (slopeTop - slopeBottom) / 2;

                            console.log('bottom', slopeBottom);
                            console.log('top', slopeTop);

                            slopePoly = new M.Polygon({
                                points: [
                                    new M.Vector({ x: -slopeHalfWidth * tw, y: th / 2 }), // bottom vertex
                                    new M.Vector({ x: slopeHalfWidth * tw,    y: -th / 2 }),       // top vertex
                                    new M.Vector({ x: slopeHalfWidth * tw,    y: th / 2 })  // bottom corner
                                ]
                            });
                            console.log('poly', slopePoly);
                            slopes.push({
                                collidable: CollidableFactory.createBoundingPolygon(slopePoly),
                                position: new M.Vector({ x: (slopeBottom + slopeHalfWidth) * tw, y: (y + 0.5) * tw }),
                                renderable: RenderableFactory.createRenderPolygon(slopePoly, null, "rgba(0,0,0,1)")
                            });
                            slopeBottom = -1;
                            slopeTop = -1;
                            console.groupEnd();
                        }
                    }
                }
                console.log('slopes');
                console.log(slopes);
                return slopes;
            },
            generateRenderableList = function (mapdata, tileset, tw, th) {
                return _.compact(_.flatten(_.map(mapdata, function (row, y) {
                    return _.map(row, function (tile, x) {
                        if (tile && 1 < tile.length) {
                            return {
                                position: new M.Vector({
                                    x: (x * tw) + (tw / 2),
                                    y: (y * th) + (th / 2)
                                }),
                                renderable: tileset[tile]
                            };
                        }
                        return false;
                    });
                })));
            };

        function Map(options) {
            if (!(this instanceof Map)) {
                return new Map(options);
            }
            options = options || {};
            if (!options.tile_width || !options.tile_height) {
                return Log.error("Map must have a tile width and tile height", true);
            }
            console.log(options.slopetile);
            this.tile_width         = options.tile_width;
            this.tile_height        = options.tile_height;
            this.tileset            = createTileset(options.tileset, this.tile_width, this.tile_height);
            this.background         = options.background;
            this.background_image   = options.background_image || null;
            this.tilemap            = options.tilemap;
            this.mapdata            = generateMapData(options.mapdata, this.tilemap);
            this.slopes             = generateSlopes(this.mapdata, this.tile_width, this.tile_height, options.slopetile);
            this.collision_data     = generateCollisionData(this.mapdata, this.tile_width, this.tile_height, options.player_spawn);
            this.player_spawn       = determinePlayerSpawn(this.mapdata, this.tile_width, this.tile_height, options.player_spawn);
            this.collidables        = _.compact(_.flatten(this.collision_data));
            this.collidables_subset = reduceGeometry(this.collidables).concat(this.slopes);
            this.renderables        = generateRenderableList(this.mapdata, this.tileset, this.tile_width, this.tile_height).concat(this.slopes);
        }

        Map.prototype.getCollidables = function () {
            return this.collidables_subset;
        };

        Map.prototype.getRenderables = function () {
            return this.renderables;
        };

        return Map;
    }());
    return Map;
});