/**
 * Created by faide on 2014-04-22.
 */
define(function () {
    "use strict";
    var Message = (function () {
        function Message(msg, cb, delay) {
            if (!(this instanceof Message)) {
                return new Message(msg, cb);
            }
            this.msg = msg;
            this.cb = cb;
            this.delay = delay;
        }
        return Message;
    }());
    return Message;
})