/**
 * Created by faide on 2014-05-06.
 */
define(['underscore', 'alien/logging'], function (_, Log) {
    "use strict";
    var Map = (function () {
        function Map(options) {
            if (!(this instanceof Map)) {
                return new Map(options);
            }
            options = options || {};
            if (!options.tile_width || !options.tile_height) {
                return Log.error("Map must have a tile width and tile height", true);
            }
            this.tile_width  = options.tile_width;
            this.tile_height = options.tile_height;
            this.tileset     = options.tileset;
        }

        return Map;
    }());
    return Map;
});