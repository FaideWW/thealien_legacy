var alien = alien || {};

alien.Scene = function(properties) {
    properties = properties || {};
    var t = {};
    t.entities = [];
    for (var k in properties) {
        if (properties.hasOwnProperty(k)) {
            t[k] = properties[k];
        }
    }

    return t;
};

alien.Scene.prototype.extend = function(extension) {
    for (var k in extension) {
        if (extension.hasOwnProperty(k)) {
            this[k] = extension[k];
        }
    }
};

alien.Scene.prototype.sort = function(entities) {
    if (entities.length < 2) {
        return entities;
    }
    var l = entities.length,
        pivot,
        p,
        lower = [],
        higher = [];
}

    for (var k = 0; k < entities.length; k++) {
        if (k === p) {
            continue;
        }

        if (entities[k].position.z <= pivot.position.z) {
            lower.push(entities[k]);
        } else {
            higher.push(entities[k]);
        }

        return this.sort(lower).concat([pivot], this.sort(higher));
    }
}

alien.Scene.prototype.addEntity = function(entity, position) {
    position = position || alien.Math.Vector();
    entity.extend(position);
    this.entities.push(entity);
    var index = this.entities.length - 1;
    this.entities = this.sort(this.entities);
    return index;
};

//this is a deceptively expensive operation (O(n)) for large scenes, 
//so use it sparingly.  maybe rewrite later to accept entity indexing
alien.Scene.prototype.find = function(entity) {
    for (var k = 0; k < this.entities.length; k++) {
        if (this.entities[k] === entity) {
            return k;
        }
    }
    return -1;
};

alien.Scene.prototype.removeEntity = function(entity) {
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

alien.Scene.prototype.update = function(dt) {
    for (var k = 0; k < this.entities.length; k++) {
        this.entities[k].trigger('update', dt);
    }
};
