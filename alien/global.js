/**
 * Miscellaneous functions/shims/polyfills that should be available to all objects 
 */

function deepClone(obj) {
    var new_obj = {};
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var new_arr = [];
        for (var i = 0; i < obj.length; i += 1) {
            new_arr.push(deepClone(obj[i]));
        }
        return new_arr;
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
                    new_obj[prop] = deepClone(obj[prop]);
                }
            }else{
                new_obj[prop] = obj[prop];
            }
        }
    }
    return new_obj;
}