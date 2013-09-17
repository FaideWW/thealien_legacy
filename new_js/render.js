var alien = alien || {};

alien.RenderSystem.draw = function(canvas, scene) {
    var c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);

    for (var k = 0; k < scene.entities; k++) {
        //if the entity has a position, grab it; otherwise set to origin
        var pos = scene.entities[k]['position'] || alien.Math.Vector();
        //trigger a draw event with the position and context
        scene.entities[k].trigger('draw', {
            context: c,
            position: pos
        });
    }
};