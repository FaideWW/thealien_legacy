var canvas = document.getElementById('canvas');

var _ = new alien.Game({
	'canvas': canvas
});

var drawPolygon = function(e, props) {
	if (e.hasOwnProperty('polygon')) {
		var c = props.context,
			p = props.position,
			i;
		c.fillStyle = e.polygon.color;
		c.beginPath();
		c.moveTo(p.x + e.polygon.points[0].x, p.y + e.polygon.points[0].y);
		for (i = 1; i < e.polygon.points.length; i += 1) {
			c.lineTo(p.x + e.polygon.points[i].x, p.y + e.polygon.points[i].y);
		}
		c.closePath();
		c.fill();
	}
};

var red = new alien.Entity({
	'position': new alien.Math.Vector({
		x: 100,
		y: 100,
		z: 0.5
	}),
	'polygon': {
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
	}
});
var blue = new alien.Entity(red);

red.extend({
	draggable: {
		isDraggable: true,
		isBeingDragged: false,
		srcX: 0,
		srcY: 0
	}
}).on('mousedown', function(e, data) {
	if (_.running && e.draggable.isDraggable && !e.draggable.isBeingDragged) {
		e.draggable.isBeingDragged = true;
		e.draggable.srcX = data.event.layerX;
		e.draggable.srcY = data.event.layerY;
	}
}).on('mousemove', function(e, data) {
	
	if (_.running && e.draggable.isBeingDragged) {
		console.log('dragging');
		e.position.x += data.event.layerX - e.draggable.srcX;
		e.position.y += data.event.layerY - e.draggable.srcY;
		e.draggable.srcX = data.event.layerX;
		e.draggable.srcY = data.event.layerY;
	}
}).on('mouseup', function(e, data) {
	if (e.draggable.isBeingDragged) {
		e.draggable.isBeingDragged = false;
	}
});

blue.polygon.color = "rgba(0,0,255,1)";
blue.position = new alien.Math.Vector({
	x: 170,
	y: 170,
	z: 0.6
});

var listener = new alien.Entity({
	renderable: false
});

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
var s1 = new alien.Scene({
		entities: [red, blue, listener]
});





_.setScene(s1);
_.registerEventListeners(_.canvas, _.scene);

