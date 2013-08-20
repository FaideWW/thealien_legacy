var alien = alien || {};

alien.Vector = function() {
	return {
		add: function(v1, v2) {
			return {
				x: v1.x + v2.x,
				y: v1.y + v2.y
			};
		},
		sub: function(v1, v2) {
			return {
				x: v1.x - v2.x,
				y: v1.y - v2.y
			};
		},
		mag: function(v1) {
			return Math.sqrt(Math.pow(v1.x,2) + Math.pow(v1.y,2));
		},
		normalize: function(v1) {
			return {
				x: v1.x / this.mag(v1),
				y: v1.y / this.mag(v1)
			};
		},
		dot: function(v1, v2) {
			return (v1.x * v2.x) + (v1.y * v2.y);
		},
		crossmag: function(v1, v2) {
			return (v1.x * v2.y) - (v1.y * v2.x);
		}
	};
}();