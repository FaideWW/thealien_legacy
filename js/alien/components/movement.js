define(["../math", "../global", "../promise"], function(AlienMath, Global, Promise) {
    /**
     * alien.components.movement
     */

    var movement = (function() {
        'use strict';

        var pi2 = Math.PI * 2;

        var movement_module = {
            anchor: "root",
            period: 2000,
            repeat: false,
            currTime: 0,
            running: false,
            lastPosition: new AlienMath.Vector(),
            start: function(initial) {
                if (!this.running) {
                    //TODO: separate interpolation code from step 
                    //      so we can set inital positions from a 
                    //      universal interval
                    this.running = true;
                }
                return this;
            },
            pause: function() {
                if (this.running) {
                    this.running = false;
                }
                return this;
            },
            stop: function() {
                if (this.running) {
                    this.pause();
                    //this.currTime = 0;
                    //this.lastPosition = new AlienMath.Vector();
                }
                return this;
            },
            update: function(e, dt) {
                if (this.running) {
                    this.step(e, dt);
                }
                return this;
            },
            complete: function() {
                if (!this.repeat) {
                    this.stop();
                }
            },
            getPosition: function() {
                return lastPosition;
            }
        };

        var movement = {
            CircleAround: (function() {
                'use strict';

                function CircleAround(args) {
                    // enforces new
                    if (!(this instanceof CircleAround)) {
                        return new CircleAround(args);
                    }
                    var args = args || {};

                    this.radius = args.radius || 20;

                    this.anchor = args.anchor || this.anchor;
                    this.period = args.period || this.period;
                    this.repeat = args.repeat || this.repeat;
                    this.anticlockwise = args.anticlockwise || false;
                    
                }

                CircleAround.prototype.step = function(e, dt) {
                    var totalTime = this.currTime + dt;
                    if (totalTime >= this.period && !this.repeat) {
                        this.complete();
                        return;
                    }
                    this.currTime = totalTime % this.period;
                    this.setProgress(this.currTime / this.period);
                    var interpolation = (this.currTime / this.period) * pi2;
                    if (this.anticlockwise) {
                        interpolation = pi2 - interpolation;
                    }

                    var newPosition = new AlienMath.Vector({
                        x: Math.cos(interpolation),
                        y: Math.sin(interpolation)
                    }).mul(this.radius);

                    var anchor_position = this.anchor;
                    if (this.anchor === "root") {
                        anchor_position = e.getPosition();
                    } else {
                        anchor_position = this.anchor.getPosition();
                    }
                    e.setPosition(anchor_position.add(newPosition.sub(this.lastPosition)));
                    this.lastPosition = newPosition;
                };

                CircleAround.prototype.extend = Global.extend;

                CircleAround.prototype.extend(movement_module);
                CircleAround.prototype.extend(Promise);

                return CircleAround;
            
            }()),

            AxisOscillate: (function() {
                'use strict';
            
                function AxisOscillate(args) {
                    // enforces new
                    if (!(this instanceof AxisOscillate)) {
                        return new AxisOscillate(args);
                    }
                    // constructor body
                }
            
                AxisOscillate.prototype.step = function(e, dt) {
                    // method body
                };
            
                AxisOscillate.prototype.extend = Global.extend;

                AxisOscillate.prototype.extend(movement_module);
                AxisOscillate.prototype.extend(Promise);

                return AxisOscillate;
            
            }())
        };

        return movement;

    }());

    return movement;
});