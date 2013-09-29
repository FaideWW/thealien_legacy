(function (alien, game) {
	'use strict';

	window.onresize = function() {
		game.canvas.width = window.innerWidth;
		game.canvas.height = window.innerHeight;
		alien.RenderSystem.draw(game.canvas, game.scene);
	}

	window.onresize();
}(alien, _));