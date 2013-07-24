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
			}
		},
		dot: function(v1, v2) {
			return (v1.x * v2.x) + (v1.y * v2.y);
		},
		crossmag: function(v1, v2) {
			return (v1.x * v2.y) - (v1.y * v2.x);
		}
	};
}();