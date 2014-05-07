/**
 * Created by faide on 2014-03-10.
 */
define(function () {
    'use strict';
    var reported = [];
    return {
        log: function (msg, once) {
            // report the error to whatever error handling is in place (in this case, just dump to the console)
            if (!once || reported.indexOf(msg) === -1) {
                window.document.getElementById("time").innerHTML = msg;
            }
            if (once) {
                reported.push(msg);
            }
            return null;
        },
        error: function (msg, once) {
            if (!once || reported.indexOf(msg) === -1) {
                console.error(msg);
            }
            if (once) {
                reported.push(msg);
            }
            return null;
        },
        clearLog: function () {
            // clears all logged/stored messages
            // resets logOnce

            reported = [];
        },
        toConsole: function (msg) {
            console.log(msg);
        }
    };
});