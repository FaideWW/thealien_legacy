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

document.getElementById('tpsselect').onchange = function() {
	var tps = this.value;
	setTPSVal(tps);

};

function setTPSVal(tps) {
	alien.Timer.setTPS(tps);
	document.getElementById('tpsval').innerHTML = tps;
}

document.getElementById('tpsval').innerHTML = alien.Timer.getTPS();
