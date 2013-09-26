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

var e1 = new alien.Entity({
	'position': new alien.Math.Vector({
		x: 100,
		y: 100
	}),
	'polygon': {
		'color': "rgba(255,0,0,1)",
		'points': [
			{
				x: 0,
				y: 0
			},
			{
				x: 100,
				y: 0
			},
			{
				x: 100,
				y: 100
			},
			{
				x: 0,
				y: 100
			}
		]
	}
}).on('draw', drawPolygon)
	.on('click', function(e) {
	console.log('click');
});
var s1 = new alien.Scene({
		entities: [e1]
});

_.setScene(s1);
_.registerEventListeners(_.canvas, _.scene);
alien.RenderSystem.draw(_.canvas, _.scene);
