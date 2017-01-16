/**
 * @module peDesignerMain
 *
 * @description Simple mobile PolyXpress authoring tool.
 *
 * @summary peDesigner main().
 *
 * @copyright Michael Haungs, 2012
 * @license MIT
 *
 * @author Michael Haungs
 */

// Begin Module Header
(function() {
// End Module Header

    "use strict"; // EMCAScript 5 pragma to catch more javascript errors

    // Global Imports
    var mhLog = require("src/lib/mhLog/mhlog")();
    config.mhLog = mhLog;  /* config is a global options container */

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

    // Local Imports
    var peDC = require("./peDesignerController")(false, false, config);

    // Geolocation
    var watchPointId;
    var geoOptions = {
        enableHighAccuracy: true,
        timeout: Infinity,
        maximumAge: 0
    };

    /**
     * Application Initialization
     */
    init();

    /**
     * window.onload = init;  Don't need because of inject module loading.
     * @returns {undefined}
     */
    function init() {

        // setup geolocation, if supported
        if (navigator.geolocation) {
            watchPointId = navigator.geolocation.watchPosition(updateLocation, handleGeoError, geoOptions);
            // Calling getCurrentPosition improves accuracy (not just relying on first
            // watch position value.  Also, calls initMap once.
            navigator.geolocation.getCurrentPosition(initMap, handleGeoError);
        }

        // autologin user, if possible
        peDC.autoLogin();
    }

    /**
     * Updates geolocation in for lat/long in chapter and event editor
     * @param {type} position
     * @returns {undefined}
     */
    function updateLocation(position) {

        var slatLabelChapter = document.getElementById("slatLabel");
        slatLabelChapter.innerHTML = "(" + position.coords.latitude + ") " + "Latitude: ";
        var slngLabelChapter = document.getElementById("slngLabel");
        slngLabelChapter.innerHTML = "(" + position.coords.longitude + ") " + "Longitude: ";
        var clatLabelChapter = document.getElementById("clatLabel");
        clatLabelChapter.innerHTML = "(" + position.coords.latitude + ") " + "Latitude: ";
        var clngLabelChapter = document.getElementById("clngLabel");
        clngLabelChapter.innerHTML = "(" + position.coords.longitude + ") " + "Longitude: ";
        var elatLabelEvent = document.getElementById("elatLabel");
        elatLabelEvent.innerHTML = "(" + position.coords.latitude + ") " + "Latitude: ";
        var elngLabelEvent = document.getElementById("elngLabel");
        elngLabelEvent.innerHTML = "(" + position.coords.longitude + ") " + "Longitude: ";
    }

    function initMap(position) {

        var mapOptions = {
            center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            panControl: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            overviewMapControl: false,
            rotateControl: false
        };

        google.maps.visualRefresh = true;

        var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

        google.maps.event.addListener(map, 'click', function(event)
        {
            document.getElementById('latspan').innerHTML = event.latLng.lat().toFixed(6);
            document.getElementById('lngspan').innerHTML = event.latLng.lng().toFixed(6);
        });
    }

    function handleGeoError (err) {
        mhLog.log(mhLog.LEVEL.PRODUCTION, err.code + " " + err.message);
    }

// Begin Module Footer
}
)();
// End Module Footer
