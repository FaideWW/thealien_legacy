var t = require.config({
	paths: {
		alien: '../alien'
	}
});
require(["alien/alien"], function(alien) {

	const ASSET_PATH = "assets/";

	//convenience methods
	var vec = function() {
		var args = arguments,
			x = 0,
			y = 0,
			z = 0;
		if (typeof args[0] === "object") {
			x = args[0].x;
			y = args[0].y;
			z = args[0].z;
		} else if (typeof args[0] === "number") {
			x = args[0];
			y = args[1];
			z = args[2];
		} else {
			console.error("Invalid vector arguments");
		}
		return new alien.Math.Vector({
			x: x,
			y: y,
			z: z
		});
	};

	var canvas = document.getElementById('canvas');

	console.log(canvas);

	var _ = new alien.Game({
		'canvas': canvas
	});

	var red = new alien.Entity({
		'position': vec(100,100,0.5),
		'renderables': [new alien.components.renderable.Polygon({
			color: "rgba(75,0,0,1)",
			points: [
				vec(-50,-50),
				vec(50,-50),
				vec(50,50),
				vec(-50,50)
			]
		})],
		'behaviors': [new alien.components.behavior.Draggable()],
		'collidable': new alien.components.collidable.AABB({
			half_width: 50,
			half_height: 50
		})
	});


	var blue = new alien.Entity({
		'renderables': [new alien.components.renderable.Sprite({
			src: ASSET_PATH + 'sprite.png'
		})],
		'collidable': new alien.components.collidable.AABB({
			half_width: 16,
			half_height: 16
		})

	});
	blue.behaviors = [
		new alien.components.behavior.DrawLineBetween(),
		new alien.components.behavior.Draggable()
	];
	blue.set('position', vec(150,200,0.6));

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
		position: vec(200,200,1),
		renderables: [new alien.components.renderable.Text()],
		behaviors: [new alien.components.behavior.Follow({
			target: 'mouse',
			callback: function(e) {
				e.renderables[0].text = e.getWorldSpacePosition().x + ", " + e.getWorldSpacePosition().y;
			}
		})]
	});

	var ground = new alien.Entity({
		position: new vec(640,440),
		renderables: [new alien.components.renderable.Polygon({
			color: "rgba(0,75,0,1)",
			points: [
				vec(-640,-40),
				vec(640,-40),
				vec(640,40),
				vec(-640,40)
			]
		})],
		collidable: new alien.components.collidable.AABB({
			half_width: 640,
			half_height: 40
		}),
		isStatic: true
	});

	blue.on('collide', function(e, data) {
		if ((data.entity.isStatic || data.entity.on_ground) && data.collision.x === 0) {
			e.on_ground = true;
		}
		e.position = e.position.sub(data.collision);
	}).massless = false;

	red.isStatic = true;

	var controller = new alien.components.Controller({
		control_entity: blue,
		keymap: {
			'w,up': {
				down: function(e, data) {
					if (e.on_ground) {
						e.on_ground = false;
						e.velocity.y = -3000;
					}
				},
				up: function(e, data) {}
			},
			'a,left': {
				down: function(e, data) {
					e.velocity.x -= 1500;
				},
				up: function(e, data) {
					e.velocity.x += 1500;
				}
			},
			's,down': {
				down: function(e, data) {
					console.log('down');
				},
				up: function(e, data) {}
			},
			'd,right': {
				down: function(e, data) {
					e.velocity.x += 1500;
				},
				up: function(e, data) {
					e.velocity.x -= 1500;
				}
			}
		}
	});

	var s1 = new alien.Scene({
			entities: [
				red,
				blue,
				ground,
				text,
				listener
			]
	});
	//debugger;
	var circleScript = new alien.components.movement.CircleAround({
		radius: 100,
		repeat: true,
		anticlockwise: true
	}),
		circle2 = new alien.components.movement.CircleAround({
		radius: 100,
		period: 1000,
		repeat: true
	}),
		circle3 = new alien.components.movement.CircleAround({
		radius: 50,
		period: 250,
		repeat: true,
		anticlockwise: true
	});
	circle3.start();
	circle2.start();
	circleScript.start();

	var movement = new alien.Entity({
		position: new alien.Math.Vector({
			x: 200,
			y: 200
		}),
		renderables: [
			new alien.components.renderable.Polygon({
				color: "rgba(0,150,0,1)",
				points:  [
					vec(-10,-10),
					vec(10,-10),
					vec(10,10),
					vec(-10,10)
				]
			})
		],
		behaviors: [
			circleScript
		]
	});

	var subMovement = new alien.Entity({
		parent: movement,
		renderables: [
			new alien.components.renderable.Polygon({
				color: "rgba(150,0,0,1)",
				points: [
					vec(-10,-10),
					vec(10,-10),
					vec(10,10),
					vec(-10,10)
				]
			})
		],
		behaviors: [circle2]
	});

	var subSubMovement = new alien.Entity({
		parent: subMovement,
		renderables: [
			new alien.components.renderable.Polygon({
				color: "rgba(0,0,150,1)",
				points: [
					vec(-10,-10),
					vec(10,-10),
					vec(10,10),
					vec(-10,10)
				]
			})
		],
		behaviors: [circle3]
	});

	var circlePath = new alien.Entity({
		position: vec(200,200),
		renderables: [
			new alien.components.renderable.Circle({
				color: "rgba(0,75,0,1)",
				radius: 100
			})
		]
	}),
		subCirclePath = new alien.Entity({
			parent: movement,
			renderables: [
				new alien.components.renderable.Circle({
					color: "rgba(75,0,0,1)",
					radius: 100
				})
			]
		}),
		subSubCirclePath = new alien.Entity({
			parent: subMovement,
			renderables: [
				new alien.components.renderable.Circle({
					color: "rgba(0,0,75,1)",
					radius: 50
				})
			]
		});

	var s2 = new alien.Scene({
		entities: [
			circlePath,
			subCirclePath,
			subSubCirclePath,
			movement,
			subMovement,
			subSubMovement,
			listener
		]
	});

	var fling = new alien.components.behavior.Fling(),
		flingThis = new alien.Entity({
			position: vec(200,200),
			renderables: [
				new alien.components.renderable.Polygon({
					color: "rgba(75,0,0,1)",
					points: [
						vec(-20,-20),
						vec(20,-20),
						vec(20,20),
						vec(-20,20)
					]
				})
			],
			behaviors: [fling],
			collidable: new alien.components.collidable.AABB({
				half_height: 20,
				half_width: 20
			})
		}),

		collidee = new alien.Entity({
			position: vec(300,200),
			renderables: [
				new alien.components.renderable.Polygon({
					color: "rgba(0,75,0,1)",
					points: [
						vec(-20, -20),
						vec(20,-20),
						vec(20,20),
						vec(-20,20)
					]
				})
			],
			collidable: new alien.components.collidable.AABB({
				half_height: 20,
				half_width: 20
			})
		}),

		s3 = new alien.Scene({
			entities: [
				flingThis,
				collidee,
				listener
			]
		});

	//debugger;
	_.setScene(s3);
	_.registerEventListeners(_.canvas);



	//expose alien and current game to window
	 window.alien = alien;
	 window.game = _;
	_.run();
});