/**
 * Created by faide on 14-10-07.
 */
define(['lodash'], function (_) {
    var id = function () {
            /** @type {string}
             *    UUID generator from https://gist.github.com/gordonbrander/2230317
             */
            return "component_" + Math.random().toString(36).substr(2, 9);
        },
        game = null;

    return {
        init: function (g) {
            game = g;
        },
        defineSystem: function (loopphase, lockFn, stepFn, api) {
            var lock, sys_obj;
            if (!game) {
                throw new Error('Cannot define system without a component registry - initialize system factory first');
            }

            sys_obj = api || {};

            sys_obj.__id   = id();
            sys_obj.__lock = lockFn(game._componentFlags);
            sys_obj.step   = stepFn;


            game.addSystem(sys_obj, loopphase, true)
        }
    };
});