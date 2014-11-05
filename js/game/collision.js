/**
 * Created by faide on 14-10-08.
 */

'use strict';
define(['lodash', 'core/math'], function (_, math) {

    /*
     QT object inspired by:
     http://gamedevelopment.tutsplus.com/tutorials/quick-tip-use-quadtrees-to-detect-likely-collisions-in-2d-space--gamedev-374
     */

    // transitionary variable: once we know the continuous collision detection works consistently, we can get rid of this
    var __DO_CONTINUOUS_COLLISION = true,


        QT = (function () {
            function QT(depth, options) {
                if (!(this instanceof QT)) {
                    return new QT(depth, options);
                }

                this.__MAX_ENTITIES_PER_NODE = options.max_entities || 10;
                this.__MAX_NODE_DEPTH        = options.max_depth    || 5;

                this.depth  = depth;
                this.entities = [];
                this.bounds = {
                    x:      options.x,
                    y:      options.y,
                    width:  options.width,
                    height: options.height
                };
                this.children = [];
            }

            QT.prototype = {
                clear: function () {
                    this.entities.length = 0;
                    this.children = this.children.map(function (n) {
                        if (n) {
                            n.clear();
                        }
                        return undefined;
                    });
                },
                split: function () {
                    var half_width  = this.bounds.width / 2,
                        half_height = this.bounds.height / 2,
                        half_depth  = this.bounds.depth / 2,
                        x           = this.bounds.x,
                        y           = this.bounds.y,
                        z           = this.bounds.z;

                    this.children[0] = new QT(this.depth + 1, {
                        width:      half_width,
                        height:     half_height,
                        depth:      half_depth,
                        x:          x,
                        y:          y,
                        z:          z,
                        max_entities: this.__MAX_ENTITIES_PER_NODE,
                        max_lvl:      this.__MAX_NODE_DEPTH
                    });
                    this.children[1] = new QT(this.depth + 1, {
                        width:      half_width,
                        height:     half_height,
                        depth:      half_depth,
                        x:      x + half_width,
                        y:      y,
                        z:      z,
                        max_entities: this.__MAX_ENTITIES_PER_NODE,
                        max_lvl:      this.__MAX_NODE_DEPTH
                    });
                    this.children[2] = new QT(this.depth + 1, {
                        width:      half_width,
                        height:     half_height,
                        depth:      half_depth,
                        x:      x,
                        y:      y + half_height,
                        z:      z,
                        max_entities: this.__MAX_ENTITIES_PER_NODE,
                        max_lvl:      this.__MAX_NODE_DEPTH
                    });
                    this.children[3] = new QT(this.depth + 1, {
                        width:      half_width,
                        height:     half_height,
                        depth:      half_depth,
                        x:      x + half_width,
                        y:      y + half_height,
                        z:      z,
                        max_entities: this.__MAX_ENTITIES_PER_NODE,
                        max_lvl:      this.__MAX_NODE_DEPTH
                    });
                },
                getIndex: function (entity) {
                    // assume entity.position and entity.collidable exist
                    var index  = -1,
                        center = math.vec2(
                            this.bounds.x + this.bounds.width  / 2,
                            this.bounds.y + this.bounds.height / 2
                        ),
                        getEnclosingAABB = function (entity) {
                            var pos = entity.position,
                                collidable = entity.collidable,
                                rect = {};

                            if (collidable.type === 'aabb') {
                                rect.top_left = math.vec2(pos.x - collidable.half_width, pos.y - collidable.half_height);
                                rect.bottom_right = math.vec2(pos.x + collidable.half_width, pos.y + collidable.half_height);
                            } else if (collidable.type === 'obb') {
                                rect = math.getEnclosingRect(collidable);
                            }

                            return rect;
                        },
                        world_volume = getEnclosingAABB(entity),
                        isInUpperHalf = (world_volume.top_left.y < center.y && world_volume.bottom_right.y < center.y),
                        isInLowerHalf = (world_volume.top_left.y > center.y);

                    if (world_volume.top_left.x < center.x && world_volume.bottom_right.x < center.x) {
                        // right half
                        if (isInLowerHalf) {
                            // bottom right
                            index = 3;
                        } else if (isInUpperHalf) {
                            // top right
                            index = 1;
                        }
                    } else if (world_volume.bottom_right.x > center.x) {
                        // left half
                        if (isInLowerHalf) {
                            // bottom left
                            index = 2;
                        } else if (isInUpperHalf) {
                            // top left
                            index = 0;
                        }
                    }

                    // if index is still -1, the entity does not fit in any of the child quadrants;
                    //  it has to stay on this level

                    return index;

                },
                insert: function (entity) {
                    var index, i;
                    if (this.children[0]) {
                        index = this.getIndex(entity);

                        if (index !== -1) {
                            // if an entity can fit into a child node, put it into a child node
                            this.children[index].insert(entity);
                            return;
                        }
                    }

                    this.entities.push(entity);

                    // if the node is too heavy, split it and re-insert the entities
                    if (this.__MAX_ENTITIES_PER_NODE < this.entities.length && this.__MAX_NODE_DEPTH > this.depth) {
                        if (!this.children[0]) {
                            this.split();
                        }

                        i = 0;
                        while (i < this.entities.length) {
                            index = this.getIndex(this.entities[i]);
                            if (index !== -1) {
                                this.children[index].insert(this.entities.splice(i, 1)[0]);
                            } else {
                                i += 1;
                            }
                        }
                    }
                },
                retrieve: function (entity) {
                    var index = this.getIndex(entity),
                        matches = [];

                    if (index !== -1 && this.children[index]) {
                        matches = matches.concat(this.children[index].retrieve(entity));
                    }

                    matches = matches.concat(this.entities);

                    return matches;
                }
            };

            return QT;

        }());

    var generateQuadTree = function (options) {
            var qt;
            options = options || {};
            qt = new QT(0, {
                x: options.x,
                y: options.y,
                width: options.width,
                height: options.height,
                max_entities: options.max_entities,
                max_depth:    options.max_depth
            });

            return qt;
        },
        AABBTest = function (pos1, pos2, aabb1, aabb2) {
            var aabb_sum = {
                    half_width: aabb1.half_width + aabb2.half_width,
                    half_height: aabb1.half_height + aabb2.half_height
                },
                relative_pos = math.vec2(
                    pos2.x - pos1.x,
                    pos2.y - pos1.y
                );

            return math.vec2(
                aabb_sum.half_width  + ((relative_pos.x < 0) ? relative_pos.x : -relative_pos.x),
                aabb_sum.half_height + ((relative_pos.y < 0) ? relative_pos.y : -relative_pos.y)
            );


        },
        doShift = function (scene, e, v) {
            scene.msg.enqueue('physics', function () {

                this.shift(e, v);
            })
        },
        applySpin = function (scene, e, v, dir) {
            var spin_scalar = 5;
            scene.msg.enqueue('physics', function () {
                var spin_v = (v.x + v.y) * spin_scalar;
                this.accelerate(e, math.mul(v, spin_scalar), true);
                this.spin(e, spin_v, dir)
            })
        },
        getMinkowski = function (entity1, entity2) {
            var minkowski_diff = {
                    position: math.sub(entity2.position, entity1.position)
                },
                minkowski_collidable, poly1, poly2;


            if (entity1.collidable.type === 'aabb' && entity2.collidable.type === 'aabb') {
                minkowski_collidable = {
                    half_width:  entity1.collidable.half_width  + entity2.collidable.half_width,
                    half_height: entity1.collidable.half_height + entity2.collidable.half_height
                };

                minkowski_diff.polygon = math.polygon([
                    { x: -minkowski_collidable.half_width, y: -minkowski_collidable.half_height },
                    { x:  minkowski_collidable.half_width, y: -minkowski_collidable.half_height },
                    { x:  minkowski_collidable.half_width, y:  minkowski_collidable.half_height },
                    { x: -minkowski_collidable.half_width, y:  minkowski_collidable.half_height }
                ]);
            } else {
                // construct it from polygon
                if (entity1.collidable.type === 'aabb') {
                    poly1 = math.polygon(entity1.collidable);
                } else {
                    poly1 = entity1.collidable;
                }

                if (entity2.collidable.type === 'aabb') {
                    poly2 = math.polygon(entity2.collidable);
                } else {
                    poly2 = entity2.collidable;
                }


                // build the minkowski polygon using
                minkowski_diff.polygon = constructMinkowskiPolygon(poly1, poly2, minkowski_diff.position);
            }
            return minkowski_diff;
        },
        constructMinkowskiPolygon = function (poly1, poly2, position) {

        };

    return function(game) {
        // Collision Detection
        game.defineSystem("collision", function (flags) {
            return flags.position | flags.collidable;
        }, function (scene, dt) {
            var discreteCollision = function (entity1, entity2) {
                    var //entity1            = pair[0],
                    //entity2            = pair[1],
                        position1          = entity1.position,
                        position2          = entity2.position,
                        collidable1        = entity1.collidable,
                        collidable2        = entity2.collidable,
                        collision_manifold;


                    if (collidable1.type === "aabb" && collidable2.type === "aabb") {
                        collision_manifold = this.AABBTest(position1, position2, collidable1, collidable2);

                        if (collision_manifold.x > 0 && collision_manifold.y > 0) {
                            if (collision_manifold.x < collision_manifold.y) {
                                if (position1.x < position2.x) {
                                    collidable1.manifold = math.vec2(-1, 0);
                                    collidable2.manifold = math.vec2(1, 0);
                                    // position1 shifts left, position2 shifts right
                                    this.doShift(scene, entity1, math.vec2(-collision_manifold.x, 0));
                                    this.doShift(scene, entity2, math.vec2( collision_manifold.x, 0));

                                    if (entity1.velocity && entity2.velocity) {
                                        this.applySpin(scene, entity1, math.vec2(
                                            -entity2.velocity.x,
                                            -entity2.velocity.y
                                        ), -1);
                                        this.applySpin(scene, entity2, math.vec2(
                                            -entity1.velocity.x,
                                            -entity1.velocity.y
                                        ), 1);
                                    }

                                    collidable1.collidedX = true;
                                    collidable2.collidedX = true;

                                } else {
                                    collidable1.manifold = math.vec2( 1, 0);
                                    collidable2.manifold = math.vec2(-1, 0);
                                    // position1 shifts right, position2 shifts left
                                    this.doShift(scene, entity1, math.vec2( collision_manifold.x, 0));
                                    this.doShift(scene, entity2, math.vec2(-collision_manifold.x, 0));

                                    if (entity1.velocity && entity2.velocity) {
                                        this.applySpin(scene, entity1, math.vec2(
                                            -entity2.velocity.x,
                                            -entity2.velocity.y
                                        ), 1);
                                        this.applySpin(scene, entity2, math.vec2(
                                            -entity1.velocity.x,
                                            -entity1.velocity.y
                                        ), -1);

                                    }

                                    collidable1.collidedX = true;
                                    collidable2.collidedX = true;
                                }
                            } else {
                                if (position1.y < position2.y) {
                                    collidable1.manifold = math.vec2(0, -1);
                                    collidable2.manifold = math.vec2(0,  1);
                                    // position1 shifts up, position2 shifts down
                                    this.doShift(scene, entity1, math.vec2(0, -collision_manifold.y));
                                    this.doShift(scene, entity2, math.vec2(0,  collision_manifold.y));

                                    if (entity1.velocity && entity2.velocity) {
                                        this.applySpin(scene, entity1, math.vec2(
                                            -entity2.velocity.x,
                                            -entity2.velocity.y
                                        ), 1);
                                        this.applySpin(scene, entity2, math.vec2(
                                            -entity1.velocity.x,
                                            -entity1.velocity.y
                                        ), -1);

                                    }

                                    collidable1.collidedY = true;
                                    collidable2.collidedY = true;
                                } else {
                                    collidable1.manifold = math.vec2(0,  1);
                                    collidable2.manifold = math.vec2(0, -1);
                                    // position1 shifts down, position2 shifts up
                                    this.doShift(scene, entity1, math.vec2(0,  collision_manifold.y));
                                    this.doShift(scene, entity2, math.vec2(0, -collision_manifold.y));

                                    if (entity1.velocity && entity2.velocity) {
                                        this.applySpin(scene, entity1, math.vec2(
                                            -entity2.velocity.x,
                                            -entity2.velocity.y
                                        ), -1);
                                        this.applySpin(scene, entity2, math.vec2(
                                            -entity1.velocity.x,
                                            -entity1.velocity.y
                                        ), 1);

                                    }

                                    collidable1.collidedY = true;
                                    collidable2.collidedY = true;
                                }
                            }
                        }
                    }
                },
                ents, opts, pairs;

            // pick up actual collisions

            scene.pairs(function (entity1, entity2) {
                discreteCollision.call(this, entity1, entity2);
            }, this.__lock, this);


            // resolve potential future collisions
            if (__DO_CONTINUOUS_COLLISION) {
                opts = {
                    x: 0,
                    y: 0,
                    width: scene.renderTarget.canvas.width,
                    height: scene.renderTarget.canvas.height,
                    max_entities: scene.entities.length / 2
                };

                if (!this._entity_quadtree) {
                    this._entity_quadtree = this.genQT(opts);
                } else {
                    this._entity_quadtree.clear();
                }
                // for the time being, we use speculative contacts because it's the simplest to implement,
                //  and works well enough for our purposes


                /*
                 Procedure:
                 generate a list of possible collisions by passing the velocity trace into the quadtree
                 */

                ents = scene.map(function (e) {
                    var step_velocity,
                        initial_position,
                        final_position;

                    if (e.velocity) {
                        step_velocity = math.mul(e.velocity, dt / 1000);
                        initial_position = e.position;
                        final_position = math.add(e.position, step_velocity);
                        return {
                            __e:     e,
                            position:
                                math.add(initial_position, math.div(math.sub(final_position, initial_position), 2)),
                            collidable: {
                                type: 'aabb',
                                half_width:  e.collidable.half_width  + (Math.abs(step_velocity.x) / 2),
                                half_height: e.collidable.half_height + (Math.abs(step_velocity.y) / 2)
                            }
                        };
                    }
                }, this.__lock, this).filter(function (e) {
                    return e;
                });

                ents.forEach(function (e) {
                    this._entity_quadtree.insert(e);
                }, this);

                // shallow flatten to preserve pair structure
                pairs = _.flatten(ents.map(function (e) {
                    var entity_pairs = [];
                    this._entity_quadtree.retrieve(e).forEach(function (match) {
                        if (match !== e) {
                            /** potential performance gain: eliminate duplicate pairs with the entities swapped */
                            entity_pairs.push([e, match]);
                        }
                    });
                    return entity_pairs;
                }, this), true);
                window.pairs = pairs;


                pairs.forEach(function (pair) {
                    //discreteCollision.call(this, pair[0].__e, pair[1].__e);

                    var entity1 = pair[0].__e,
                        entity2 = pair[1].__e;



                }, this);

            }

        }, {
            _entity_quadtree: null,
            AABBTest: AABBTest,
            doShift: doShift,
            applySpin: applySpin,
            constructMinkowski: getMinkowski,
            genQT: generateQuadTree
        });
    };
});