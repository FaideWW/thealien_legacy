/**
 * Created by faide on 2014-04-22.
 */
define(['underscore'], function (_) {
    "use strict";
    var ControllerFactory = (function () {
        return {
            /**
             * A keymap takes the following form:
             *
             *  [
             *      {
             *          key:  String
             *          down: Function
             *          up:   Function
             *          once: Boolean
             *      },
             *      ...
             *  ]
             * @param keymap
             * @returns {{keymap: *}}
             */
            createKeyListener: function (keymap) {
                return {
                    keymap: keymap,
                    keys_pressed: 0
                };
            },
            /**
             * A mousemap takes the following form:
             *
             *  {
             *      mousedown: Function
             *      mouseup:   Function
             *      mousemove: Function
             *  }
             * @param mousemap
             * @returns {{mousemap: *}}
             */
            createMouseListener: function (mousemap) {
                return {
                    mousemap: mousemap
                };
            },
            createKeyBinding: function (key, down, up, once) {

                return {
                    type: "key",
                    key:  key,
                    down: down,
                    up:   up,
                    once: once
                };
            },
            createKeySequence: function (sequence, callback, once) {
                return {
                    type: "sequence",
                    sequence: sequence,
                    cb: callback,
                    once: once || false
                };
            },
            /**
             * If the function should handle both keyup and keydown
             * @param key  : String   - The key to activate on
             * @param func : Function - The callback function
             * @param once : Boolean  - The function activates once per key press
             * @returns {{key: *, down: *, up: *, once: *}}
             */
            createUnaryKeyBinding: function (key, func, once) {
                return {
                    key:  key,
                    down: func,
                    up:   func,
                    once: once
                };
            },
            createMouseMap: function (down, up, move) {
                return {
                    mousedown: down,
                    mouseup:   up,
                    mousemove: move
                };
            }
        };
    }());
    return ControllerFactory;
});