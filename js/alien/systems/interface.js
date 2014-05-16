/**
 * Created by faide on 2014-04-22.
 */
define(['underscore', 'alien/systems/event'], function (_, Event) {
    "use strict";
    var key_codes =     {
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
        modifier_keys = {
            16: false, // shift
            17: false, // ctrl
            18: false  // alt
        },
        sequences =     [],
        combos =        [],
        InterfaceSystem = {
            id:   "__INTERFACE",
            init: function (controllables) {
                _.each(controllables, function (entity) {
                    if (entity.keylistener) {
                        this.bindEntityToKeys(entity);
                    }
                    if (entity.mouselistener) {
                        this.bindEntityToMouse(entity);
                    }
                }, this);
                /* Modifier keys */
                Event.on(this, 'keydown', function (event_data) {
                    var kc = event_data.keyCode;
                    if (modifier_keys[kc] === false) {
                        modifier_keys[kc] = true;
                    }
                });
                Event.on(this, 'keyup', function (event_data) {
                    var kc = event_data.keyCode;
                    if (modifier_keys[kc] === true) {
                        modifier_keys[kc] = false;
                    }
                });
            },
            /**
             * Binds a controllable entity to the event register, allowing it to be controlled
             * @param e : Entity - Entity to be bound
             *
             */
            bindEntityToKeys: function (e) {
                _.each(e.keylistener.keymap, function (key) {
                    var kc, func_down, func_up;
                    if (key.type === "key") {
                        if (key.key === '*') {
                            /* Trigger on every key */
                            func_down = key.down;
                            func_up   = key.up;
                        } else {
                            /* Wrap each function to check for the appropriate key */
                            kc = key_codes[key.key];
                            func_down = function (event_data) {
                                if (event_data.keyCode === kc) {
                                    key.down.call(this, event_data, modifier_keys);
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
                    } else if (key.type === "sequence") {
                        kc = _.map(key.sequence.split(","), function (key) { return key_codes[key]; });
                        sequences.push({
                            entity:   e,
                            sequence: kc,
                            handler:  key.cb,
                            current:  kc,
                            once:     key.once
                        });
                    } else if (key.type === "combination") {
                        combos.push({
                            entity:      e,
                            combination: _.map(key.combination.split("+"), function (key) { return key_codes[key]; }),
                            handler:     key.cb,
                            current:     [],
                            active:      false,
                            once:        key.once
                        });
                    }
                });
                if (sequences.length) {
                    Event.on(e, 'keydown', function (event_data) {
                        var kc = event_data.keyCode;
                        _.each(sequences, function (s) {
                            if (s.current[0] === kc) {
                                /* The key is next in the sequence */
                                s.current = _.tail(s.current);
                                if (!s.current.length) {
                                    /* If the sequence is complete, trigger the callback */
                                    s.handler.call(e, event_data);
                                    if (s.once) {
                                        s.current = s.sequence;
                                    }
                                }
                            } else if (s.current.length && s.current.length !== s.sequence.length) {
                                /* The key is not next in the sequence; reset the sequence if needed */
                                s.current = s.sequence;
                            }
                        });
                    }, true);
                }
                if (combos.length) {
                    Event.on(e, 'keydown', function (event_data) {
                        var kc = event_data.keyCode;
                        _.each(combos, function (c) {
                            if (c.combination.indexOf(kc) !== -1 && c.current.indexOf(kc) === -1) {
                                c.current.push(kc);
                            }
                            if (c.current.length === c.combination.length && (!c.active || !c.once)) {
                                c.active = true;
                                c.handler.call(e, event_data);
                            }
                        });
                    });
                    Event.on(e, 'keyup', function (event_data) {
                        var kc = event_data.keyCode;
                        _.each(combos, function (c) {
                            if (c.combination.indexOf(kc) !== -1 && c.current.indexOf(kc) !== -1) {
                                c.active = false;
                                c.current.splice(c.current.indexOf(kc), 1);
                            }
                        });
                    });
                }
            },
            bindEntityToMouse: function (e) {
                Event.on(e, 'mousedown', e.mouselistener.mousemap.mousedown, null);
                Event.on(e, 'mouseup',   e.mouselistener.mousemap.mouseup,   null);
                Event.on(e, 'mousemove', e.mouselistener.mousemap.mousemove, null);
            }
        };
    return InterfaceSystem;
});