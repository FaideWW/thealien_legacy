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
        gameRegistry            = null,
        reset = function () {
            var prop;
            if (component_cache[this.__id]) {
                for (prop in component_cache[this.__id]) {
                    if (component_cache[this.__id].hasOwnProperty(prop) && prop !== '__id') {
                        this[prop] = component_cache[this.__id][prop];
                    }
                }
            }
        };

    return {
        init: function (registry) {
            gameRegistry = registry;
            // clear the cache and template storage
            component_cache = {};
            component_templates = {};
        },
        defineComponent: function (name, defaults, override) {
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

            component_templates[name].__flag =
                (gameRegistry._componentFlags[name]) ?
                    gameRegistry._componentFlags[name] :
                    gameRegistry.registerComponent(null, name);

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
                                    component[prop]() :
                                    component[prop]
                                );
                        }
                    }
                };

            if (!component_templates.hasOwnProperty(name)) {
                this.defineComponent(name, attrs);
            } else {
                component = _.defaults(component, component_templates[name]);
            }
            // override mandatory properties `__id`, `__flag`, and `__reset`
            component.__name  = name;
            component.__id    = id();
            component.__flag  = component_templates[name].__flag;
            // since we are no longer using `new` to define components, we need to manually bind the reset
            //  execution context to the component object
            component.__reset = reset.bind(component);

            component_cache[component.__id] = _.cloneDeep(component);

            // seal the component in a Proxy (function attributes can no longer be fetched as functions)
            return new Proxy(component, proxy_handler);
        }
    };

});