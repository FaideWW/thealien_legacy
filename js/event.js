var alien = alien || {};

/**
*	Event handler - captures raw js/browser events and passes them to the registered
*  callbacks
*/
alien.Event = function() {
	var init = false,
		components = {},
		events = {
			'click': [],
			'dblclick': [],
			'mousedown': [],
			'mouseup': [],
			'mouseover': [],
			'mouseout': [],
			'mousemove': [],
			'keydown': [],
			'keyup': [],
			'update': []
		},
		mouseevents = [
			'click',
			'dblclick',
			'mousedown',
			'mouseup',
			'mouseover',
			'mouseout',
		],
		entities = [];

	function generateEvent(e) {
		//augment event with some extra parameters
		e = e || {};
		return e;
	}

	function catchEvent(e) {
		if (alien.Game.isRunning()) {
			//check all mouse events
			var en = [];
			if (mouseevents.indexOf(e.type) > -1) {
				console.log('mouse event');
				en = filterEntitiesAtPoint({ x: e.layerX, y: e.layerY }, events[e.type]);
				console.log('draw order');
				console.log(en);
				if (en.length > 0) {
					console.log(en);
				}
			} else {
				en = events[e.type];
			}
			for (var e_id in en) {
				var listener = entities[en[e_id]].components.get('listener');
				for (var cb in listener.events[e.type]) {
					listener.events[e.type][cb](e, entities[en[e_id]]);
				}
			}
		}
	}

	//find any listening entities at the current mouse position
	function filterEntitiesAtPoint(point, en) {
		var e_at_point = [];
		for (var e_id in en) {
			entity = entities[e_id];
			if (entity.components.has('collider')) {
				if (alien.Collision.pointCollide(point, entity)) {
					console.log('entity ' + entity.gid + ' at mouse');
					e_at_point.push(entity.gid);
				}
			}
		}
		return e_at_point;
	}

	return {
		listeners: function() {
			return events;
		},
		entities: function() {
			return entities;
		},
		loadScene: function(scene) {
			this.unloadScene();
			for (var e in scene.entities) {
				this.registerListener(scene.entities[e]);
			}
		},
		unloadScene: function() {
			entities = [];
			listeners = [];
			events = {
				'click': [],
				'dblclick': [],
				'mousedown': [],
				'mouseup': [],
				'mouseover': [],
				'mouseout': [],
				'mousemove': [],
				'keydown': [],
				'keyup': [],
				'update': []
			};
		},
		registerEvent: function(eventType, callback, identifier) {
			if (!(eventType in events)) {
				//if the event does not exist
				alien.Report.error("Invalid event type");
				return false;
			}

			if (events[eventType][identifier] !== undefined) {
				//if this binding exists
				alien.Report.error(eventType + " event already registered with that identifier");
				return false;
			}
			//bind it
			events[eventType][identifier] = callback;
			return true;
		},

		unregisterEvent: function(eventType, identifier) {
			if (!(eventType in events)) {
				//if the event does not exist
				alien.Report.error("Invalid event type");
				return false;
			}

			if (events[eventType].indexOf(identifier) === -1) {
				//if the binding does not exist (just warn, not a fatal error)
				alien.Report.warning("Event with that identifier does not exist");
				return true;
			}

			delete events[eventType][identifier];
			return true;
		},

		registerListener: function(entity) {
			if (init) {
				if (entity.components.has('listener')) {
					if (!(entity in entities)) {
						entities[entity.gid] = entity;
						var listener = entity.components.get('listener');
						//double index for fast searching
						for (var e in listener.events) {
							events[e].push(entity.gid);
						}
						return entity.gid;
					}
				}
			}
			return false;
		},

		unregisterListener: function(entity) {
			if (init) {
				if (entity.components.has('listener')) {
					var l = entity.components.get('listener');
					for (var e in l.events) {
						if (l.l_id in events[e]) {
							delete events[e][l];
						}
					}
					if (l in listeners) {
						delete listeners[l];
					}
				}
			}
		},

		init: function(canvas) {
			init = true;

			//bind events to the canvas
			console.log(events);
			for (var eventType in events) {
				canvas.addEventListener(eventType, catchEvent);
			}
			return init;
		}
	};
}();

var ListenerFactory = function(options) {
	options = options || {};
	options.componentname = "listener";
	options.events = options.events || {};
	return options;
}