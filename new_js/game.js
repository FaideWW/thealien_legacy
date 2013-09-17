var alien = alien || {};

alien.Game = function(options) {
    this.canvas = options['canvas_element'];
    this.timer = 0;
    this.running = false;
};

alien.Game.prototype.setScene(scene) {
    this.scene = scene;
}

alien.Game.prototype.run() {
    if (running) {
        step();
    }
}

alien.Game.prototype.step() {

}

alien.Game.prototype.stop() {

}