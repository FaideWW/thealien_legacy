define(["./entity", "./bsp", "./math", "./game"], function(Entity, BSP, AlienMath, Game) {


    /**
     * alien.Scene
     * 
     * The scene is the container for a unique group of entities and
     *  positions representing a particular game level or state.
     *
     * When the scene is initialized, or entities are added, they are
     * sorted by z-value for the rendering order.
     *
     * Scenes are similar in structure to Entities in that they operate
     * as containers, and their functionality can be extended by modules.
     *
     * alien.Scene.prototype.sort ( entities : [alien.Entity] )
     *     - sorts entities by their position.z using a stable quicksort
     *
     * alien.Scene.prototype.addEntity ( entity : alien.Entity ) 
     *     - adds the entity to Scene.entities and sorts the list
     *
     * alien.Scene.prototype.find ( entity : alien.Entity ) 
     *     - returns the current index of entity in Scene.entities
     *
     * alien.Scene.prototype.removeEntity ( entity : alien.Entity | Number )
     *     - removes the designated Entity from Scene.entities
     *
     * alien.Scene.prototype.update ( dt : Number ) 
     *     - propagates an update event to all Entities in Scene.entities
     *
     * Scene adds position and parent to the Entity.default_properties list.
     *  It also adds getWorldSpacePosition to the Entity prototype, as well as attaching
     *  setScene to alien.Game.prototype.
     *
     * todo
     *  - properly index entities for faster search and removal
     *  - possibly implement BSP trees for Entity storage, which
     *    can then be used for both rendering and collision
     * 
     */

    var Scene = (function() {
        'use strict';

        function createCollisionTree(entities) {
            var polys = [];
            for (var e in entities) {
                if (entities[e].collidable === undefined || !entities[e].isStatic) {
                    continue;
                }
                polys.concat(entities[e].collidable.getVectors());
            }
            return BSP.build(polys);
        }

        function Scene(properties) {
            // enforces new
            if (!(this instanceof Scene)) {
                return new Scene(properties);
            }
            // constructor body
            properties = properties || {};
            
            this.entities = [];
            this.collision_tree = null;
            for (var k in properties) {
                if (properties.hasOwnProperty(k)) {
                    this[k] = properties[k];
                }
            }

            //bind mouse entity
            this.mouse = new Entity({
            });
            this.mouse.on('mousemove', function(e, data) {
                e.position = new AlienMath.Vector({
                    x: data.event.offsetX,
                    y: data.event.offsetY
                });
            });

            this.entities.push(this.mouse);

            if (this.entities.length > 0) {
                this.entities = this.sort(this.entities);
            }
        }

            Scene.prototype.extend = function(extension) {
                for (var k in extension) {
                    if (extension.hasOwnProperty(k)) {
                        this[k] = extension[k];
                    }
                }
            };

            Scene.prototype.sort = function(entities) {
                if (entities.length < 2) {
                    return entities;
                }
                var l = entities.length,
                p = Math.floor(entities.length / 2),
                pivot = entities[p],
                lower = [],
                higher = [];

                for (var k = 0; k < entities.length; k++) {
                    if (k === p) {
                        continue;
                    }

                    if (entities[k].getWorldSpacePosition().z <= pivot.getWorldSpacePosition().z) {
                        lower.push(entities[k]);
                    } else {
                        higher.push(entities[k]);
                    }

                }
                return this.sort(lower).concat([pivot], this.sort(higher));
            };

            Scene.prototype.addEntity = function(entity) {
                this.entities.push(entity);
                this.entities = this.sort(this.entities);
                var index = this.find(entity);
                return index;
            };

            //this is a deceptively expensive operation (O(n)) for large scenes, 
            //so use it sparingly.  maybe rewrite later to accept entity indexing
            Scene.prototype.find = function(entity) {
                for (var k = 0; k < this.entities.length; k++) {
                    if (this.entities[k] === entity) {
                        return k;
                    }
                }
                return -1;
            };

            Scene.prototype.removeEntity = function(entity) {
                //debugger;
                if (typeof entity === 'number') {
                    //the entity is an index
                    if (entity === -1) {
                        //find() returned empty, i.e. the entity is not in the array
                        return null;
                    }
                    return this.entities.splice(entity,1);
                } else {
                    return this.removeEntity(this.find(entity));
                }
            };

            Scene.prototype.update = function(dt) {
                for (var k = 0; k < this.entities.length; k++) {
                    this.entities[k].trigger('update', dt);
                }
            };

        //extend Entity prototype for requisite properties
        Entity.default_properties.position = new AlienMath.Vector();
        Entity.default_properties.parent = null;
        Entity.default_properties.isStatic= false;

        Entity.prototype.getWorldSpacePosition = function() {
            return (this.parent === null) ? this.position : this.parent.getWorldSpacePosition().add(this.position);
        };

        Entity.prototype.getPosition = function() {
            return this.position;
        }


        Entity.prototype.setPosition = function(p) {
            this.position = p;
        };

        Game.prototype.setScene = function(scene) {
            this.scene = scene;
            return this.scene;
        };

        return Scene;

    }());
    return Scene;
});