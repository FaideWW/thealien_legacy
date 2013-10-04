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
	})]
});


var blue = new alien.Entity(red);
blue.behaviors = [
	new alien.components.behavior.DrawLineBetween(),
	new alien.components.behavior.Draggable()
];
blue.set('parent', red).set('position', new alien.Math.Vector({ x: 150, y: 150,	z: 0.6 }));
blue.renderables[0].color = "rgba(0,0,255,1)";

var listener = new alien.Entity();
listener.on('keydown', function(e, data) {
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
			e.renderables[0].text = e.getPosition().x + ", " + e.getPosition().y;
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
			listener
		]
});





_.setScene(s1);
_.registerEventListeners(_.canvas, _.scene);

