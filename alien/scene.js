var alien = alien || {};

alien.Scene = (function(alien) {
    'use strict';

    function Scene(properties) {
        // enforces new
        if (!(this instanceof Scene)) {
            return new Scene(properties);
        }
        // constructor body
        properties = properties || {};
        var t = {};
        t.entities = [];
        for (var k in properties) {
            if (properties.hasOwnProperty(k)) {
                t[k] = properties[k];
            }
        }

        //bind mouse entity
        t.mouse = new alien.Entity({
        });
        t.mouse.on('mousemove', function(e, data) {
            e.position = new alien.Math.Vector({
                x: data.event.layerX,
                y: data.event.layerY
            });
        });

        t.entities.push(t.mouse);

        if (t.entities.length > 0) {
            t.entities = this.sort(t.entities);
        }
        return t;
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

                if (entities[k].getPosition().z <= pivot.getPosition().z) {
                    lower.push(entities[k]);
                } else {
                    higher.push(entities[k]);
                }

            }
            return this.sort(lower).concat([pivot], this.sort(higher));
        };

        Scene.prototype.addEntity = function(entity) {
            this.entities.push(entity);
            var index = this.entities.length - 1;
            this.entities = this.sort(this.entities);
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
    alien.Entity.prototype.position = alien.Entity.prototype.position || new alien.Math.Vector();
    alien.Entity.prototype.parent = alien.Entity.prototype.parent || null;

    alien.Entity.prototype.getPosition = function() {
        return (this.parent === null) ? this.position : this.parent.position.add(this.position);
    }


    alien.Game.prototype.setScene= function(scene) {
        this.scene = scene;
        return this.scene;
    };


    return Scene;

}(alien));