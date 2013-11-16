var alien = alien || {};

/**
 * BSP tree implementation for entity storage in scenes
 *
 * requirements
 * - tree must be able to be built/rebuilt in between timesteps and without 
 *   interfering with other subsystems
 * - tree must be able to balance itself when entities are added or removed
 * - tree must be able to recalculate an entity's position in the tree after
 *   a position change in worldspace
 * - tree must be able to, given an entity as input, produce a reduced set of
 *   candidate entities for collision detection
 * 
 * notes/observations
 * - building a tree: - pick an entity and a face on that entity
 *                      (the axis we choose is arbitrary but we choose one 
 *                      parallel to the entity so that we have to do less splitting)
 *                    - the 'front' node contains all entities on the same side
 *                      of the face as the rest of the entity's polygon
 *                    - the 'back' node contains everything on the other side
 *                    - entities that are on both sides are split into two 
 *                      polygons, one on either side
 *                    - repeat for non-empty front and back nodes
 *
 * - searching a tree - given an entity and the root, find out what side of the 
 *                      tree the entity lies on
 *                    - if the entity is on the front side, repeat for node->front
 *                    - if the entity is on the back side or if the entity straddles 
 *                      the line, return node and test for collision on that entity
 *
 * - moving objects   - build the tree with static objects first and freeze
 *                    - on every timestep, insert dynamic objects at their new 
 *                      positions
 *                    - since dynamic objects do not intersect static ones in a 
 *                      significant way, they can be represented by their positions 
 *                      only (point insertion is cheap)
 *                    - dynamic objects can be children of static or other dynamic
 *                      objects, but static objects can never be children of 
 *                      dynamic ones.
 *       **addendum** - modifying an existing BSP tree is very expensive with
 *                      O(n) costs _per_ object.  better to keep static objects
 *                      in the tree and dynamic objects in another structure 
 *                      more capable of handling moving objects, then test against them
 *                    - heuristically we can assume that there is far more static geometry
 *                      than dynamic, so a BSP tree is still a cost effective structure,
 *                      since it is by far the fastest implementation that I know of
 * 
 *
 * - timestep outline - physics update
 *                    - add dynamic objects into bsp tree
 *                    - collision detection
 *                    - collision resolution
 *                    - re-add collided objects into tree
 *                    - render
 *                    - drop dynamic objects
 *
 * 3D BSP Trees operate on triangles.  2D tress degrade gracefully to operate on
 * bounded vectors.  
 * **addendum**       - not entirely accurate.  3d BSP trees have the additional
 *                      benefit of being able to directly pipe to the renderer.  
 *                      unless we upgrade to using a flat 3-space (i.e. z = 0 for all),
 *                      we can't use BSP trees for rendering.  needs more research
 *
 * Vectors
 * -------
 * to classify a point in relation to an axis,  we examine the dot product of the direction
 *  from an arbitrary point on the axis to the original point, and the normal to the axis.
 *  if the dot product is > 0, the point is in front of the axis.  if it's < 0, the point is 
 *  behind the axis.  if it's === 0 (or within tolerance), it's colinear.
 *
 * if the signs of both endpoints of a vector are equal*, we're done.  just return the 
 *  corresponding space the vector is in (back or front).
 *
 * if the signs do not match, we have to split the vector into its spacial subcomponents
 *  and consider each separately.
 *
 * collision detection requires explicit declaration of 'front' and 'back' sides,
 * so that solids do not incorrectly register as traversible space.  
 *
 * faces of a polygon point outwards - inner side is the back, outer side is the front
 *
 * the convention is that the points of a polygon are defined in a clockwise manner,
 * for example, a unit square would be defined as:
 *
 * points: {
 *     { x: 0, y: 1 }, //top left
 *     { x: 1, y: 1 }, //top right
 *     { x: 1, y: 0 }, //bottom right
 *     { x: 0, y: 0 }  //bottom left
 * }
 * 
 */

alien.BSP = (function() {
    'use strict';


    var BSPTree = (function() {
        'use strict';
    
        function BSPTree(args) {
            // enforces new
            if (!(this instanceof BSPTree)) {
                return new BSPTree(args);
            }
            args = args || {};
            if (args.axis) {
                this.axis = args.axis;
            }
            if (args.colinear) {
                this.colinear = args.colinear;
            }
            if (args.front) {
                this.front = args.front;
            }
            if (args.back) {
                this.back = args.back;
            }
            if (args.isLeaf) {
                this.isLeaf = args.isLeaf; 
            }
            if (args.isSolid) {
                this.isSolid = args.isSolid; // used for checking if a given leaf is non-traversible space
            }
        }
        return BSPTree;

        BSPTree.prototype.getVectors = function() {
            var list = [];
            if (this.isNull) {
                return list;
            }
            if (this.front) {
                if (Array.isArray(this.front) && this.front.length > 0) {
                    list.append(this.front);
                } else {
                    list.append(this.front.getPolygons());
                }
            }
            list.append(this.axis);
            if (this.colinear) {
                list.append(this.colinear);
            }
            if (this.back) {
                if (Array.isArray(this.back) && this.front.length > 0) {
                    list.append(this.back);
                } else {
                    list.append(this.back.getPolygons());
                }
            }
            return list;
        };

        BSPTree.prototype.isNull = function() {
            return this.axis ? false : true;
        };
    }());

    function classifyPoint(point, axis) {
        point = point.sub(axis.source)
        axis = axis.dest.sub(axis.source)
        var dot = point.dot(axis.nml());
        if (dot > 0) {
            return 1;
        }
        if (dot < 0) {
            return -1;
        }
        return 0;
    }

    function splitVector(vec, axis) {
        //returns parametric coefficients for the 
        // two sides of a vector split along an axis
        var p = vec.source,
            q = axis.source,
            r = vec.dest.sub(p),
            s = axis.dest.sub(q);
        //formula via Graphics Gems "Intersection of two lines in three-space"
        // t = (q - p) x s / (r x s)
        var t = (q.sub(p).cmg(r)) / (r.cmg(s));
        return {
            front: {
                source: p,
                dest:   p.add(r.mul(t))
            },
            back: {
                source: p.add(r.mul(t)),
                dest:   p.add(r)
            }
        };
    }

    var BSP = {
        generate: function(scene) {
            //generate a tree from a scene.  
            // will only operate on objects with an isStatic flag 
        },
        create: function(args) {
            return new BSPTree(args);
        },
        build: function(vectors, side) {
            //if this looks like quicksort, it's because it essentially is:
            // partition all vectors by their relation to the dividing axis,
            // then recursively build those partitions into nodes
            // O(n log n) performance
            

            //recursive base case
            if (vectors.length === 0) {
                if (side === undefined) {
                    console.error("side must be defined for leaf nodes");
                    return null;
                }
                return this.create({
                    isLeaf: true,
                    isSolid: side
                });
            }

            //heuristically select a dividng axis
            //for now we just use the middle element
            
            var dv      = Math.floor(vectors.length / 2),
                dv_axis = vectors[dv],
                f       = [],
                b       = [],
                ca      = [];

            //sort vectors 
            for (var v in vectors) {
                if (vectors.hasOwnProperty(v)) {
                    var s_side = classifyPoint(vectors[v].source, dv_axis),
                        d_side = classifyPoint(vectors[v].dest, dv_axis);
                    if ((s_side > 0 && d_side < 0) || (s_side < 0 && d_side > 0)) {
                        //split the vector
                        var subvectors = splitVector(vectors[v], vectors[dv]);
                        f.push(subvectors.front);
                        b.push(subvectors.back);
                    } else {
                        //add the vector to the appropriate list
                        
                        if (s_side === 0 && d_side === 0) {
                            //colinear
                            ca.push(vectors[v]);
                        } else if (s_side > 0 || d_side > 0) {
                            //front
                            f.push(vectors[v]);
                        } else {
                            //back
                            b.push(vectors[v]);
                        }
                    }
                }
            }

            return this.create({
                axis: vectors[dv],
                colinear: ca,
                front: this.build(f, false),
                back: this.build(b, true),
                isLeaf: false,
                isSolid: false
            });
        },
        print: function(tree, pre) {
            //this is a debug function for visualizing a tree
            
            if (tree === undefined) {
                return;
            }
            pre = pre || "root";
            if (Array.isArray(tree)) {
                console.log(tree);
                return;
            }
            var header;
            if (tree.axis) {
                header = tree.axis.source + ", " + tree.axis.dest;
            } else {
                header = "leaf";
            }
            console.group(pre + " " + header);
                if (header === "leaf") {
                    console.log("isSolid:" + tree.isSolid);
                }
                this.print(tree.colinear, "colinear");
                this.print(tree.front, "front");
                this.print(tree.back, "back");
            console.groupEnd();
        },
        search: function(polygon, node) {
            //classify each point in the polygon based on the 
            // node's axis
            //if they are all equal, search(polygon, tree.child) 
            // where child is the front or back depending on classification
            //if they are not all equal, the poly intersects the axis
            // so return the axis
            //if we're at a leaf node, return it
            
            //base case
            if (node.isLeaf) {
                return node;
            }

            var last_class = 10;
            for (var point in polygon) {
                if (polygon.hasOwnProperty(point)) {
                    var point_classification = classifyPoint(polygon[point], node.axis);
                    if (last_class !== 10 && last_class !== point_classification) {
                        return node;
                    }
                    last_class = point_classification;
                }
            }
            if (last_class > 0) {
                return this.search(polygon, node.front);
            } else {
                return this.search(polygon, node.back);
            }
        }
    }

    alien.Entity.default_properties.isStatic = false;

    return BSP;

}());