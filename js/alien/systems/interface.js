/**
 * Created by faide on 2014-04-22.
 */
define(['underscore', 'alien/systems/event'], function (_, Event) {
    "use strict";
    var key_codes = {
            'backspace': 8,
            'tab': 9,
            'enter': 13,
            'shift': 16,
            'ctrl': 17,
            'alt': 18,
            'pausebreak': 19,
            'capslock': 20,
            'esc': 27,
            'pageup': 33,
            'pagedown': 34,
            'end': 35,
            'home': 36,
            'left': 37,
            'up': 38,
            'right': 39,
            'down': 40,
            'insert': 45,
            'delete': 46,
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            'a': 65,
            'b': 66,
            'c': 67,
            'd': 68,
            'e': 69,
            'f': 70,
            'g': 71,
            'h': 72,
            'i': 73,
            'j': 74,
            'k': 75,
            'l': 76,
            'm': 77,
            'n': 78,
            'o': 79,
            'p': 80,
            'q': 81,
            'r': 82,
            's': 83,
            't': 84,
            'u': 85,
            'v': 86,
            'w': 87,
            'x': 88,
            'y': 89,
            'z': 90,
            'leftwin': 91,
            'rightwin': 92,
            'select': 93,
            'num0': 96,
            'num1': 97,
            'num2': 98,
            'num3': 99,
            'num4': 100,
            'num5': 101,
            'num6': 102,
            'num7': 103,
            'num8': 104,
            'num9': 105,
            'numtimes': 106,
            'numplus': 107,
            'numminus': 109,
            'numdot': 110,
            'numdivide': 111,
            'f1': 112,
            'f2': 113,
            'f3': 114,
            'f4': 115,
            'f5': 116,
            'f6': 117,
            'f7': 118,
            'f8': 119,
            'f9': 120,
            'f10': 121,
            'f11': 122,
            'f12': 123,
            'numlock': 144,
            'scrolllock': 145,
            ';': 186,
            '=': 187,
            ',': 188,
            '-': 189,
            '.': 190,
            '/': 191,
            '`': 192,
            '[': 219,
            '\\': 220,
            ']': 221,
            '\'': 222
        },
        InterfaceSystem = {
            init: function (controllables) {
                _.each(controllables, function (entity) {
                    if (entity.keylistener) {
                        this.bindEntityToKeys(entity);
                    }
                    if (entity.mouselistener) {
                        this.bindEntityToMouse(entity);
                    }
                }, this);
            },
            /**
             * Binds a controllable entity to the event register, allowing it to be controlled
             * @param e : Entity - Entity to be bound
             *
             */
            bindEntityToKeys: function (e) {
                _.each(e.keylistener.keymap, function (key) {
                    var kc, func_down, func_up;
                    if (key.key === '*') {
                        /* Trigger on every key */
                        func_down = key.down;
                        func_up   = key.up;
                    } else {
                        /* Wrap each function to check for the appropriate key */
                        kc = key_codes[key.key];
                        func_down = function (event_data) {
                            if (event_data.keyCode === kc) {
                                key.down.call(this, event_data);
                            }
                        };
                        func_up = function (event_data) {
                            if (event_data.keyCode === kc) {
                                key.up.call(this, event_data);
                            }
                        };
                    }
                    if (key.down) {
                        Event.on(e, 'keydown', func_down, key.once);
                    }
                    if (key.up) {
                        Event.on(e, 'keyup', func_up, null);
                    }
                });
            },
            bindEntityToMouse: function (e) {
                Event.on(e, 'mousedown', e.mouselistener.mousemap.mousedown, null);
                Event.on(e, 'mouseup',   e.mouselistener.mousemap.mouseup,   null);
                Event.on(e, 'mousemove', e.mouselistener.mousemap.mousemove, null);
            }
        };
    return InterfaceSystem;
});