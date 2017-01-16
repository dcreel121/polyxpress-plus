var mhLog = require("src/lib/mhLog/mhlog.js")();
var pfGPS = require("src/js/pointFinderGPS.js");

// Variable needed to control testing
var testing = false;

// window.onload = main;
if (!testing)
    main();

// EventHandlers
function main() {
    // initialization
    mhLog.setLoggingLevel(mhLog.LEVEL.ALL);

    detectBrowser();

    if (navigator.geolocation) {
        pfGPS.setup();
    }
    else {
        alert("Oops, no geolocation support");
    }

}

function detectBrowser() {
    var useragent = navigator.userAgent;

    if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1) {
        //document.getElementById("mapview").classList.add('mobileMap');
        //commenting this out as applied style directly in html
    }
}

