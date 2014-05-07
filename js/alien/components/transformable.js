/**
 * Created by faide on 2014-04-24.
 */

define(['alien/utilities/math'], function (M) {
    "use strict";
    var TransformableFactory = (function () {
        return {
            createTransformable: function (t, s, r) {
                return {
                    translate: t || new M.Vector(),
                    scale:     s || new M.Vector({x: 1, y: 1}),
                    rotate:    r || 0
                };
            }
        };
    }());
    return TransformableFactory;
});