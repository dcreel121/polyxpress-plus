/**
 * @name peMain
 * @requires pePlayerController
 * @requires mhLog
 * @version 0.1 [June 1, 2014]
 * @author Michael Haungs
 * @license MIT
 * @copyright Copyright 2012 Michael Haungs [mhaungs at calpoly.edu]
 * @desc pePlayer initialization.
 */

// Begin Module Header
(function () {
    // End Module Header

    "use strict"; // EMCAScript 5 pragma to catch more javascript errors

    // Global Imports
    var mhLog = require("src/lib/mhLog/mhlog")();
    config.mhLog = mhLog;

    /*
     * Configuration
     */
    if( config.production ) {
        mhLog.setLoggingLevel(mhLog.LEVEL.PRODUCTION);
        mhLog.setShowStackTrace(false);  // Only use in special debugging
    } else {
        mhLog.setLoggingLevel(mhLog.LEVEL.DEBUG);
        mhLog.setShowStackTrace(false);  // Only use in special debugging
    }

    /*
     * Local Imports
     */
    var pePC = require("src/js/pePlayerController")(config);

    /*
     * Global initialization
     */

    function init() {
        var msg;

        if (typeof navigator.geolocation === "undefined") {
            msg = "PolyXpress requires geolocation support.  ";
            var pElem = document.getElementById("errorPage");
            pElem.innerHTML = msg;
            $.mobile.changePage("#notFunctional", "flip", false, true);
        } else {
            pePC.checkIfAuthenticated();  // Will auto-login if still authenticated
            // Otherwise, will login after user hits "login" button.
        }

        /* Not detecting browsers now.  I ran into a problem that caused mobile
         * browsers to not display correctly.  For now, need to leave the following
         * styles hardcoded to map_canvas:  width:device-width;height:300px;
         */
        //detectBrowser();

    }

    //window.onload = init;  Don't need because of inject module loading
    init();

    function detectBrowser() {
        var useragent = navigator.userAgent;

        if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') !== -1) {
            document.getElementById("map_canvas").classList.add('mobileMap');
            document.getElementById("map_canvas2").classList.add('mobileMap');
        }
    }

// Begin Module Footer
})();
// End Module Footer