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
			'keyup': []
		},
		mouseevents = [
			'click',
			'dblclick',
			'mousedown',
			'mouseup',
			'mouseover',
			'mouseout',
			'mousemove'
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
				en = filterEntitiesAtPoint({ x: e.layerX, y: e.layerY }, events[e.type]);
			} else {
				en = events[e.type];
			}
			for (var e_id in en) {
				var listener = entities[e_id].components.get(components.l);
				for (var cb in listener.events[e.type]) {
					listener.events[e.type][cb]();
				}
			}
		}
	}

	//find any listening entities at the current mouse position
	function filterEntitiesAtPoint(point, en) {
		var e_at_point = [];
		for (var e_id in en) {
			entity = entities[e_id];
			if (entity.components.has(components.c)) {
				if (alien.Collision.pointCollide(point, entity)) {
					e_at_point.push(entity);
				}
			}
		}
		return e_at_point;
	}

	return {
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
				if (entity.components.has(components.l)) {
					if (!(entity in entities)) {
						entities.push(entity);
						var listener = entity.components.get(components.l);
						//double index for fast searching
						for (var e in listener.events) {
							events[e].push(entities.length - 1);
						}
						return entities.length - 1;
					}
				}
			}
			return false;
		},

		unregisterListener: function(entity) {
			if (init) {
				if (entity.components.has(components.l)) {
					var l = entity.components.get(components.l);
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

		init: function(listener, collider, canvas) {
			init = true;
			components = {
				l: listener,
				c: collider
			};
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
	options.componentname = "Listener";
	options.events = options.events || {}; 
	return options;
}