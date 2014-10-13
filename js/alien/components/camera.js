/**
 * Created by faide on 2014-04-24.
 */

define(['alien/utilities/math'], function (M) {
    "use strict";
    var CameraFactory = (function () {
        return {
            createCamera: function (output_halfwidth, output_halfheight, view_halfwidth, view_halfheight, lerpzone_radius, track_rotation, view_range_minx, view_range_miny, view_range_maxx, view_range_maxy) {
                return {
                    output: {
                        half_width:  output_halfwidth,
                        half_height: output_halfheight
                    },
                    view:  {
                        half_width: view_halfwidth,
                        half_height: view_halfheight
                    },
                    range: {
                        min: {
                            x: view_range_minx,
                            y: view_range_miny
                        },
                        max: {
                            x: view_range_maxx,
                            y: view_range_maxy
                        }
                    },
                    lerpzone_radius: lerpzone_radius || 0,
                    position: null,
                    track_rotation: track_rotation || true
                };
            }
        };
    }());
    return CameraFactory;
})