var alien = alien || {};

alien.Game = function(options) {
    this.canvas = options['canvas_element'];
    this.timer = 0;
    this.running = false;
};

alien.Game.prototype.setScene= function(scene) {
    this.scene = scene;
};

alien.Game.prototype.run = function() {
    if (running) {
        step();
    }
};

alien.Game.prototype.step = function() {

};

alien.Game.prototype.stop = function() {

};