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

/*
 * mhGeo
 *
 * Description:  Provide an accurate (within a delta) location watchpoint
 *
 * Copyright (c) 2013 Michael Haungs <mhaungs at calpoly.edu>
 * License: MIT
 *
 * @author Michael Haungs <mhaungs at calpoly.edu>
 */

// Begin Module Header
(function(parent) {
// End Module Header

    // Assigning exports like this:
    //     * allows dependency injection (aka var sample = require("./sample.js")(app);)
    //     * Creates a new mhGeo object every time it is called; there is no code sharing
    //       between objects.
    parent.exports = function() {

        "use strict";  // EMCAScript 5 pragma

        // External Modules
        var mhLog = require("/src/lib/mhlog.js")();
        // Note:  Will inherit the logging level
        mhLog.setLoggingLevel(mhLog.LEVEL.DEBUG);

        /*
         ************ Module Variables *************
         */

        // Exported Container and test container  (Leave this here...do want unique copies every time called.)
        var mhGeo = {};
        mhGeo.test = {};

        // Private variables (stored in closure of object)
        var geoOptions = {
            timeout: 30000, // Wait up to 10 seconds before failing
            enableHighAccuracy: true,
            maximumAge: 0  // always get a fresh location
        };
        var minAccuracy = 300;
        var p = 0.2;  // smothing factor (puts more weight on new data)
        var watchPointId = null;
        var latlongFrom;
        var averageAccuracy = 100;  // Start with mediocre accuracy
        var averageDistanceMoved = 0;

        /*
         ************ Initialization methods *************
         */

        /*
         ************ Public methods *************
         */

        mhGeo.startWatch = function(initMap, locationEventHandler) {
            mhLog.log(mhLog.LEVEL.DEBUG, "startWatch: called");
            var wrappedHandler;

            // Set current location immediately and call initMap..then set a watchpoint for future updates
            navigator.geolocation.getCurrentPosition(initMap, displayError, geoOptions);

            // Add current location tracking
            if (watchPointId === null)
            {
                mhLog.log(mhLog.LEVEL.DEBUG, "startWatch: watchPosition called." + watchPointId);
                latlongFrom = null;  // start with a fresh history
                averageAccuracy = 100;  // start with mediocre accuracy
                averageDistanceMoved = 0;
                wrappedHandler = __locationEventHandler.bind(this, locationEventHandler); // Curry handler
                watchPointId = navigator.geolocation.watchPosition(wrappedHandler, displayError, geoOptions);
            } else {
                mhLog.log(mhLog.LEVEL.PRODUCTION, "startWatch Error: watchPosition already called");
            }
        };

        mhGeo.stopWatch = function() {
            mhLog.log(mhLog.LEVEL.DEBUG, "stopWatch: watchPointId: " + watchPointId +
                    " geoOptions = " + JSON.stringify(geoOptions));
            if (watchPointId)
            {
                mhLog.log(mhLog.LEVEL.DEBUG, "stopWatch: aa = " + mhGeo.getAverageAccuracy());
                navigator.geolocation.clearWatch(watchPointId);
                watchPointId = null;
            }
        };

        mhGeo.getAverageAccuracy = function() {
            return averageAccuracy;
        };

        mhGeo.setMinAccuracy = function(min) {
            minAccuracy = min;
        };

        /*
         ************ Private methods *************
         */

        /**
         * __locationEventHandler : geolocation watch handler to track user position
         * @param {function} userCallback user callback to handle updated position
         * @param {position object} position
         * @returns {undefined}
         */
        function __locationEventHandler(userCallback, position)
        {
            mhLog.log(mhLog.LEVEL.DEBUG, "__locationEventHandler: lat = " + position.coords.latitude +
                    " lng = " + position.coords.longitude);

            if (position.coords.accuracy < minAccuracy) {
                // FIXME:  Future work...this possible has errors:  positionCorrection(position);
                accuracySmoothing(position);
                userCallback(position);
            } else {
                // message that too inaccurate
                mhLog.log(mhLog.LEVEL.PRODUCTION, "Geolocation Watch:  Dropping inaccurate point (" +
                        position.coords.accuracy + ").");
                averageAccuracy += 20;  // Penalize accuracy
                // cap how bad accuracy can get
                if (averageAccuracy > 500) {
                    averageAccuracy = 500;
                }

            }
        }

        function positionCorrection(position) {
            var d, latlongTo, latlongToAdj;

            latlongTo = google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            // Movement Correction
            if (latlongFrom) {
                d = google.maps.geometry.spherical.computeDistanceBetween(latlongFrom, latlongTo);
                if (d >= averageDistanceMoved) {
                    averageDistanceMoved = p * averageDistanceMoved + (1 - p) * d;
                    // Given the adjustments, how far should we go?
                    latlongToAdj = google.maps.geometry.spherical.interpolate(latlongFrom,
                            latlongTo, averageDistanceMoved / d);
                    // transfer adjustments to "position" variable
                    position.coords.latitude = latlongToAdj.lat();
                    position.coords.longitude = latlongToAdj.lng();
                }
                else {
                    averageDistanceMoved = d;
                }
            }

            // Save previous position
            latlongFrom = latlongTo;
        }

        /**
         * Accuracy Correction (exponential moving average)
         * @param {Coordinates} position
         */
        function accuracySmoothing(position) {
            averageAccuracy = (averageAccuracy * p) + ((1 - p) * position.coords.accuracy);
        }

        /*
         * Error Functions
         */

        function displayError(error)
        {
            var errorTypes =
                    {
                        0: "Unknown error",
                        1: "Permission denied by user",
                        2: "Position is not available",
                        3: "Request timed out"
                    };
            var errorMessage = errorTypes[error.code];
            if (error.code === 0 || error.code === 2)
            {
                errorMessage = errorMessage + " " + error.message;
            }

            mhLog.log(mhLog.LEVEL.PRODUCTION, "MAP ERROR:  " + errorMessage);
        }


        /*
         ************ Export Module *************
         */

        return mhGeo;
    };

// Begin Module Footer
})(getGlobalContainer());
// End Module Footer

/*
 * If this is in a browser not using inject.s, then need to create/use a
 * global variable to hold module exports.  If this is in Node or a browser
 * using inject.js, use module.exports.
 */

function getGlobalContainer() {
    var container;

    if (typeof module !== 'undefined') {
        // We are using commmonJS (probably in Node or using inject.js)
        container = module;
    } else {
        if (typeof window !== 'undefined') {
            // In a browser, use a global variable
            window.exports = window.exports || {};
            container = window;
        }
    }

    return container;
}

