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
		color: "rgba(255,0,0,1)",
		points: [
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
	'behaviors': [new alien.components.behavior.Draggable()],
	'collidable': new alien.components.collidable.AABB({
		half_width: 50,
		half_height: 50
	})
});


var blue = new alien.Entity(red);
blue.behaviors = [
	new alien.components.behavior.DrawLineBetween(),
	new alien.components.behavior.Draggable()
];
blue.set('position', new alien.Math.Vector({ x: 150, y: 150,	z: 0.6 }));
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

var ground = new alien.Entity({
	position: new alien.Math.Vector({
		x: 300,
		y: 400
	}),
	renderables: [new alien.components.renderable.Polygon({
		color: "rgba(0,255,0,1)",
		points: [
			new alien.Math.Vector({
				x:-300,
				y: -50
			}),
			new alien.Math.Vector({
				x:300,
				y: -50
			}),
			new alien.Math.Vector({
				x:300,
				y: 50
			}),
			new alien.Math.Vector({
				x:-300,
				y: 50
			}),
		]
	})],
	collidable: new alien.components.collidable.AABB({
		half_width: 300,
		half_height: 50
	}),
	staticObject: true
});

red.on('collide', function(e, data) {
	console.log('RED COLLISION');
	console.log(data.collision);
})
blue.on('collide', function(e, data) {
	if (data.entity.staticObject) {
		e.on_ground = true;
	}
	e.position = e.position.sub(data.collision);
})

var s1 = new alien.Scene({
		entities: [
			red,
			blue,
			ground,
			text,
			listener
		]
});





_.setScene(s1);
_.registerEventListeners(_.canvas, _.scene);

