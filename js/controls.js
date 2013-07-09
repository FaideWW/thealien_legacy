/* controls */

document.getElementById('step').onmousedown = function() {
	alien.Game.begin();
};

document.getElementById('step').onmouseup = function() {
	if (alien.Game.isRunning()) {
		alien.Game.stop();
		document.getElementById('run').innerHTML = "Run";
	}
};

document.getElementById('run').onclick = function() {
	if (alien.Game.isRunning()) {
		alien.Game.stop();
		this.innerHTML = "Run";
	} else {
		alien.Game.begin();
		this.innerHTML = "Stop";
	}
};

document.getElementById('fps').onchange = function() {
	var fps = this.value;
	setFPSVal(fps);

};

function setFPSVal(fps) {
	alien.Timer.setFPS(fps);
	document.getElementById('fpsval').innerHTML = fps;
}

document.getElementById('fpsval').innerHTML = alien.Timer.getFPS();
