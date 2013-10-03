var canvas = document.getElementById('canvas');

var _ = new alien.Game({
	'canvas': canvas
});

var red = new alien.Entity({
	'position': new alien.Math.Vector({
		x: 100,
		y: 100,
		z: 0.5
	}),
	'renderables': [new alien.components.renderable.Polygon({
		'color': "rgba(255,0,0,1)",
		'points': [
			new alien.Math.Vector({
				x: -50,
				y: -50
			}),
			new alien.Math.Vector({
				x: 50,
				y: -50
			}),
			new alien.Math.Vector({
				x: 50,
				y: 50
			}),
			new alien.Math.Vector({
				x: -50,
				y: 50
			})
		]
	})],
	'behaviors': [new alien.components.behavior.Draggable()]
});
var blue = new alien.Entity(red);

// red.extend({
// 	draggable: {
// 		isDraggable: true,
// 		isBeingDragged: false,
// 		srcX: 0,
// 		srcY: 0
// 	}
// }).on('mousedown', function(e, data) {
// 	if (_.running && e.draggable.isDraggable && !e.draggable.isBeingDragged) {
// 		e.draggable.isBeingDragged = true;
// 		e.draggable.srcX = data.event.layerX;
// 		e.draggable.srcY = data.event.layerY;
// 	}
// }).on('mousemove', function(e, data) {
	
// 	if (_.running && e.draggable.isBeingDragged) {
// 		console.log('dragging');
// 		e.position.x += data.event.layerX - e.draggable.srcX;
// 		e.position.y += data.event.layerY - e.draggable.srcY;
// 		e.draggable.srcX = data.event.layerX;
// 		e.draggable.srcY = data.event.layerY;
// 	}
// }).on('mouseup', function(e, data) {
// 	if (e.draggable.isBeingDragged) {
// 		e.draggable.isBeingDragged = false;
// 	}
// });

blue.renderables[0].color = "rgba(0,0,255,1)";
blue.position = new alien.Math.Vector({
	x: 170,
	y: 170,
	z: 0.6
});

var listener = new alien.Entity();

listener.on('keydown', function(e, data) {
	console.log(data);
	if (data.event.keyCode === 32) {
		if (_.running) {
			_.stop();
		} else {
 			_.run();
		}
	}
});

var text = new alien.Entity({
	position: new alien.Math.Vector({
		x: 200,
		y: 200,
		z: 1
	}),
	renderables: [new alien.components.renderable.Text()],
	behaviors: [new alien.components.behavior.Follow({
		target: 'mouse',
		callback: function(e) {
			e.renderables[0].text = e.position.x + ", " + e.position.y; 
		}
	})]
});

var line = new alien.Entity({
	position: new alien.Math.Vector({
		z: 0.9
	}),
	renderables: [new alien.components.renderable.Line({
		source: red,
		dest: 'mouse',
		linewidth: 5
	})]
});


var s1 = new alien.Scene({
		entities: [
			red, 
			blue, 
			text, 
			line,
			listener
		]
});





_.setScene(s1);
_.registerEventListeners(_.canvas, _.scene);

