/**
 * Miscellaneous functions/shims/polyfills that should be available to all objects 
 */
define(function() {
    var Global = {
        deepClone: function(obj) {
            var new_obj = {};
            if (Object.prototype.toString.call(obj) === '[object Array]') {
                var new_arr = [];
                for (var i = 0; i < obj.length; i += 1) {
                    new_arr.push(this.deepClone(obj[i]));
                }
                return new_arr;
            }
            if (obj === null) {
                return null;
            }
            if (typeof obj === 'object' && 'clone' in obj) {
                return obj.clone();
            }else if (typeof obj !== 'object') {
                return obj;
            }
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (typeof prop === 'object') {
                        if (prop.hasOwnProperty('clone')) {
                            new_obj[prop] = obj[prop].clone();
                        } else {
                            new_obj[prop] = this.deepClone(obj[prop]);
                        }
                    }else{
                        new_obj[prop] = obj[prop];
                    }
                }
            }
            return new_obj;
        },
        /**
         * Global.extend
         *     augments an object with a module
         *
         *     properties of a module can include:
         *         primitives
         *         other objects
         *         functions
         *
         *     functions have a special syntax: by default,
         *         if the object being augmented has an existing
         *         function of the same name,, the new function
         *         is called after the execution of the existing
         *         one has completed.
         *
         *         if the function name in the module is preceded
         *         by a !, the existing function will be overwritten
         *         with the new function.
         *         
         *         for example, in this module:
         *         { 
         *              "foo": function() {}, 
         *              "!bar": function() {} 
         *         }
         *         `obj.foo` will be appended, and
         *         `obj.bar` will be overwritten.
         *         
         * 
         */
        extend: function(module) {
            var property;
            for (property in module) {
                if (module.hasOwnProperty(property)) {
                    if (typeof(property) === "function") {
                        if (property[0] === "!") {
                            //override operator
                            this[(property.substring(1))] = module[property];
                        } else {
                            if (this[property]) {
                                (function(func_name, component) {
                                    var old_func_name = "__" + func_name;
                                    while (component.hasOwnProperty(old_func_name)) {
                                        old_func_name = "__" + old_func_name;
                                    }
                                    component[old_func_name] = component[func_name];
                                    component[func_name] = function() {
                                        component[old_func_name].apply(component, arguments);
                                        module[func_name].apply(component, arguments);
                                    }
                                })(property, this);
                            } else {
                                this[property] = module[property];
                            }
                        }
                    } else if (typeof(module[property]) === "object") {
                        this[property] = Global.deepClone(module[property]);
                    } else {
                        this[property] = module[property];
                    }
                }
            }
            return this;
        }
    };
    return Global;
});