var alien = alien || {};

alien.GameObject = function() {
	var global_id = 0;
	var objs = [];
	function newObj(poly_array, color, origin, depth) {
		var objs.push({
			gid: global_id;
			poly: poly_array,
			col: color,
			o: origin,
			d: depth
		});
		global_id++;
		return objs[global_id-1];
	}
}();