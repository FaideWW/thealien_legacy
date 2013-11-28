define(["../math", "../global", "../promise"], function(AlienMath, Global, Promise) {
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
                    this._progress = 0;

                    this.running = false;

                    this.extend(Promise);

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

                CircleAround.prototype.complete = function() {
                    //debugger;
                    if (!this.repeat) {
                        this.stop();
                    }
                };

                CircleAround.prototype.step = function(e, dt) {
                    var totalTime = this.currTime + dt;
                    if (totalTime >= this.period) {
                        this.complete();
                    }
                    this.currTime = totalTime % this.period;
                    this._progress = this.currTime / this.period;
                    var interpolation = (this.currTime / this.period) * pi2;

                    var newPosition = new AlienMath.Vector({
                        x: Math.cos(interpolation),
                        y: Math.sin(interpolation)
                    });

                    var anchor_position = this.anchor;
                    if (this.anchor === "root") {
                        anchor_position = e.getPosition();
                    }

                    e.setPosition(anchor_position.add(newPosition.sub(this.lastPosition)));

                    this.lastPosition = newPosition;

                };

                CircleAround.prototype.extend = Global.extend;

                return CircleAround;
            
            }())
        };

        return movement;

    }());

    return movement;
});