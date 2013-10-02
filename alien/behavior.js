var alien = alien || {};

alien.components = alien.components || {};

alien.components.behavior = (function() {
    'use strict';

    var behavior = {
        Follow: (function() {
            'use strict';
        
            function Follow(args) {
                // enforces new
                if (!(this instanceof Follow)) {
                    return new Follow(args);
                }
                args = args || {};
                if (!args.hasOwnProperty('target')) {
                    console.error("Follow requires a target");
                    return null;
                }
                this.target = args.target;
                this.callback = args.callback || function() {};
            }
        
            Follow.prototype.update = function(e, s, dt) {
                if (this.target === 'mouse') {
                    this.target = s.mouse;
                }
                if (JSON.stringify(e.position) !== JSON.stringify(this.target.position)) {
                    e.position = this.target.position;
                    this.callback(e);
                }
            }

            Follow.prototype.clone = function() {
                return new Follow(this);
            }
        
            return Follow;
        
        }())
    };

    return behavior;

}());