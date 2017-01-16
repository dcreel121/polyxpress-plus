/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Michael Haungs <mhaungs at calpoly.edu>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @name mhLog
 * @version 0.1 [June 1, 2014]
 * @author Michael Haungs
 * @copyright Copyright 2012 Michael Haungs [mhaungs at calpoly.edu]
 * @fileoverview A simple utility to control log output.  You can optionally display
 * an abbreviated call stack to better understand the location of the message.
 */

/* global exports: true */
module.exports = function() {

    /*jshint globalstrict: true*/
    "use strict";  // EMCAScript 5 pragma to catch more javascript errors

    /*
     ************ Module Variables *************
     */

    // Log level enumeration
    var LEVEL = {
        ALL: 0,
        DEBUG: 1,
        DEVELOPMENT: 2,
        PRODUCTION: 3
    };

    var currentLevel = LEVEL.PRODUCTION;
    var strace = false; // Boolean that toggles displaying a stack trace

    /*
     ************ Initialization methods *************
     */

    /*
     ************ Public methods *************
     */
    function setShowStackTrace(val) {
        if (typeof val === 'boolean') {
            strace = val;
        }
    }

    function setLoggingLevel(level) {
        if (levelValid(level)) {
            currentLevel = level;
        }
    }

    function log(level, msg) {
        if (levelValid(level)) {
            if (level >= currentLevel) {
                if (strace === true)
                    logCallTrace();
                console.log("mhlog: [" + timestamp() + "] Message: " + msg);
                return msg;
            }
        }
        return null;
    }

    /*
     ************ Private methods *************
     */

    function levelValid(level) {
        return (level <= LEVEL.PRODUCTION && level >= LEVEL.ALL);
    }

    // Works in Safari, Chrome, and FireFox
    function logCallTrace() {
        var stackArray, i = 0, entry, results = [];

        try {
            throw new Error("mhLog");
        }
        catch (e) {
            if (e.stack) {
                stackArray = e.stack.split('\n');
                entry = stackArray.shift(); // get rid of reference to this function (logCallTrace)
                while (stackArray.length > 0 && i < 4) {
                    entry = stackArray.shift();  // get one level of call stack
                    results.push(entry.slice(0, entry.indexOf('@')) // keep everything up to @ symbol (Safari)
                            .replace(/^\s+|\s+$/g, '') // Trim whitespaces (Chrome)
                            .replace(/\(http.*$/g, '')); // Remove http reference (Chrome)
                    i++;
                }
                console.log("mhLog: Call Trace: " + results.join(", "));
            }
        }
    }

    function timestamp() {
        var ts = new Date();
        return ts;
    }

    /*
     ************ Exports *************
     */

    return {
        LEVEL: LEVEL,
        setShowStackTrace: setShowStackTrace,
        setLoggingLevel: setLoggingLevel,
        log: log
    };

};
