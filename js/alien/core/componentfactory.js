/**
 * Created by faide on 14-10-06.
 */
define(['lodash'], function (_) {
    var id = function () {
            /** @type {string}
             *    UUID generator from https://gist.github.com/gordonbrander/2230317
             */
            return Math.random().toString(36).substr(2, 9);
        },
        component_cache     = {},
        component_templates = {},
        game                = null,
        deferred_components = [],
        reset = function () {
            var prop;
            if (component_cache[this.__id]) {
                for (prop in component_cache[this.__id]) {
                    if (component_cache[this.__id].hasOwnProperty(prop) && prop !== '__id' && prop !== '__flag') {
                        this[prop] = component_cache[this.__id][prop];
                    }
                }
            }
        };

    return {
        init: function (g) {
            game = g;
            deferred_components.forEach(function (c) {
                c.__flag =
                    (game._componentFlags[c.__name]) ?
                        game._componentFlags[c.__name] :
                        game.registerComponent(null, c.__name);
                if (c.__entity) {
                    c.__entity.key |= c.__flag;
                    c.__entity.components[c.__flag] = c;
                }
            }, this);
            deferred_components = [];
        },
        defineComponentTemplate: function (name, defaults, override) {
            var prop;
            if (component_templates.hasOwnProperty(name) && !override) {
                throw new Error('Component', name, 'has an existing template');
            }

            component_templates[name] = {};

            for (prop in defaults) {
                if (defaults.hasOwnProperty(prop)) {
                    component_templates[name][prop] = _.cloneDeep(defaults[prop]);
                }
            }
            return component_templates[name];
        },
        createComponent: function (name, attrs) {
            // one of the rare cases we want to bind by reference rather than value
            var component = attrs || {},
                proxy_handler = {
                    get: function (component, prop) {
                        if (prop in component) {
                            return (
                                (typeof component[prop] === 'function' && prop !== '__reset') ?
                                    component[prop]((game ? game.__state : {})) :
                                    component[prop]
                                );
                        }
                    }
                },
                proxied_component;

            if (!component_templates.hasOwnProperty(name)) {
                this.defineComponentTemplate(name, component);
            } else {
                component = _.defaults(component, component_templates[name]);
            }
            // override mandatory properties `__id`, `__flag`, and `__reset`
            component.__name  = name;
            component.__id    = id();

            // since we are no longer using `new` to define components, we need to manually bind the reset
            //  execution context to the component object
            component.__reset = reset.bind(component);


            /*
                seal the component in a Proxy (function attributes can no longer be fetched as functions)

                the component must be sealed AFTER the `__reset` partial is bound  (to preserve function attributes),
                      but BEFORE `__flag` is set because `__flag` can be deferred but has to be resolved
                      on the final object (the Proxy)

             */
            proxied_component = new Proxy(component, proxy_handler);


            if (game) {
                proxied_component.__flag  =
                    (game._componentFlags[name]) ?
                        game._componentFlags[name] :
                        game.registerComponent(null, name);
            } else {
                proxied_component.__flag = 0;
                deferred_components.push(proxied_component);
            }

            component_cache[component.__id] = _.cloneDeep(component);

            return proxied_component;
        },
        reset: function () {
            //clear templates and component cache
            component_cache = {};
            component_templates = {};
            deferred_components = [];
        }
    };

});