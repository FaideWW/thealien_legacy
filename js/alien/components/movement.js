define(["../math", "../global"], function(AlienMath, Global) {
    /**
     * alien.components.movement
     */

    var movement = (function() {
        'use strict';

        var pi2 = Math.PI * 2;

        var movement = {
            CircleAround: (function() {
                'use strict';

            
                function CircleAround(args) {
                    // enforces new
                    if (!(this instanceof CircleAround)) {
                        return new CircleAround(args);
                    }
                    var args = args || {};
                    this.anchor = args.anchor || "root";
                    this.radius = args.radius || 20;
                    this.period = args.period || 2000;
                    this.repeat = args.repeat || false;
                    this.lastPosition = new AlienMath.Vector();
                    this.currTime = 0;

                    this.running = false;
                }

                CircleAround.prototype.start = function(initial) {
                    if (!this.running) {
                        this.running = true;
                    }   
                    return this;
                };

                CircleAround.prototype.pause = function() {
                    if (this.running) {
                        this.running = false;
                    }
                    return this;
                };

                CircleAround.prototype.stop = function() {
                    if (this.running) {
                        this.pause();
                        this.currTime = 0;
                        this.lastPosition = new AlienMath.Vector();
                    }
                    return this;
                };

                CircleAround.prototype.update = function(e, dt) {
                    if (this.running) {
                        this.step(e, dt);
                    }
                    return this;
                }

                CircleAround.prototype.done = function() {
                    console.log("done");
                    if (!this.repeat) {
                        this.stop();
                    }
                };

                CircleAround.prototype.step = function(e, dt) {
                    var totalTime = this.currTime + dt;
                    if (totalTime > this.period) {
                        this.done();
                    }
                    this.currTime = totalTime % this.period;
                    var interpolation = (this.currTime / this.period) * pi2;

                    var newPosition = new AlienMath.Vector({
                        x: Math.cos(interpolation),
                        y: Math.sin(interpolation)
                    });

                    var anchor_position = this.anchor;
                    if (this.anchor === "root") {
                        anchor_position = e.getPosition();
                    }

                    e.setPosition(anchor.getPosition().add(newPosition.sub(this.lastPosition)));

                    this.lastPosition = newPosition;

                };

                /*
                    Pass an object with named functions as such:
                    {
                        func_name: function() { //do something after current behavior },
                        !func_name: function() { //overwrite current behavior }

                    }
                 */
                CircleAround.prototype.extend = Global.extend;
            
                return CircleAround;
            
            }())
        }

        return movement;

    }());

    return movement;
});