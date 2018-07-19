/*
 * Licensing and Copyright still under review...
 * Possible choices BSD, MIT, Apache
 */

/*
 * pointFinderGPS
 *
 * Description: Controls geolocation information for PointFinder app.
 *
 * @author mhaungs
 */

module.exports = (function() {
    'use strict';

    var mhLog = require("src/lib/mhLog/mhlog.js")();
    var trackingGeo = require("src/lib/mhGeo/mhGeo.js")();
    var accuracyGeo = require("src/lib/mhGeo/mhGeo.js")();

// Exported Container and test container
    var pfGPS = {};
    pfGPS.test = {};

// Variables
    var startTrackingButton, stopTrackingButton;
    var watchButton, clearWatchButton;
    var addPointButton;
    var map;
    var marker;
    var canvasUpdateId;

    var avg = {
        latSum: 0.0,
        longSum: 0.0,
        accSum: 0.0,
        count: 0.0
    };

    var geoOptions = {
        maximumAge: 0,
        enableHighAccuracy: true,
        timeout: Infinity
    };


// EventHandlers
    pfGPS.setup = function setup() {
        mhLog.log(mhLog.LEVEL.DEBUG, "in pfGPS.setup()...");

        // Set options
        var timeoutInput = document.getElementById("timeout");
        if (timeoutInput)
            timeoutInput.onchange = onTimeoutChange;

        var maximumAgeInput = document.getElementById("maximumAge");
        if (maximumAgeInput)
            maximumAgeInput.onchange = onMaximumAgeChange;

        var enableHAInput = document.getElementById("highAccuracy");
        if (enableHAInput)
            enableHAInput.onclick = onHighAccuracyChange;

        // Setup current location button handlers
        startTrackingButton = document.getElementById("startTracking");
        if (startTrackingButton)
            startTrackingButton.onclick = startTrackingCurrentLocation;
        stopTrackingButton = document.getElementById("stopTracking");
        if (stopTrackingButton) {
            stopTrackingButton.onclick = stopTrackingCurrentLocation;
            stopTrackingButton.disabled = true;
        }

        // Setup accuracy  button handlers
        watchButton = document.getElementById("watch");
        if (watchButton)
            watchButton.onclick = watchAccuracyLocation;
        clearWatchButton = document.getElementById("clearWatch");
        if (clearWatchButton) {
            clearWatchButton.onclick = clearAccuracyWatch;
            clearWatchButton.disabled = true;
        }

        // Setup point collection handlers
        addPointButton = document.getElementById("addPoint");
        if (addPointButton) {
            addPointButton.onclick = addCurrentLocation;
            addPointButton.disabled = true;
        }

        // Display map
        navigator.geolocation.getCurrentPosition(showMap);
    };

    function startTrackingCurrentLocation() {
        var blank = function() {
            console.log("Fake InitMap Called.");
        };
        trackingGeo.startWatch(blank, displayStatus);

        watchButton.disabled = true;
        clearWatchButton.disabled = true;
        addPointButton.disabled = false;
        startTrackingButton.disabled = true;
        stopTrackingButton.disabled = false;
    }

    function stopTrackingCurrentLocation() {
        trackingGeo.stopWatch();

        watchButton.disabled = false;
        clearWatchButton.disabled = true;
        addPointButton.disabled = true;
        startTrackingButton.disabled = false;
        stopTrackingButton.disabled = true;
    }

    function addCurrentLocation() {
        trackingGeo.stopWatch();

        watchButton.disabled = false;
        clearWatchButton.disabled = true;
        addPointButton.disabled = true;
        startTrackingButton.disabled = false;
        stopTrackingButton.disabled = true;

        // Now, display results of test
        var newPointNote = document.getElementById("pointNote");
        var newItem = document.createElement("li");
        newItem.innerHTML = "Average over " + avg.count + " runs<br/>";
        newItem.innerHTML += "Lat: " + (avg.latSum / avg.count) + ", Long: " + (avg.longSum / avg.count);
        newItem.innerHTML += ", Accuracy: " + (avg.accSum / avg.count);
        newItem.innerHTML += "<br/>Note: " + newPointNote.value;
        var myList = document.getElementById("pointList");
        myList.appendChild(newItem);

        avg.accSum = 0.0;
        avg.latSum = 0.0;
        avg.longSum = 0.0;
        avg.count = 0.0;
    }

    function watchAccuracyLocation() {
        var blank = function() {
            console.log('Fake InitMap called.');
        };
        accuracyGeo.startWatch(blank, displayAccuracyProgress);

        watchButton.disabled = true;
        clearWatchButton.disabled = false;
        addPointButton.disabled = true;
        startTrackingButton.disabled = true;
        stopTrackingButton.disabled = true;
    }

    function clearAccuracyWatch() {
        accuracyGeo.stopWatch();

        watchButton.disabled = false;
        clearWatchButton.disabled = true;
        addPointButton.disabled = true;
        startTrackingButton.disabled = false;
        stopTrackingButton.disabled = true;

        clearAccuracyProgress();

        // Now, display results of test
        var td = document.getElementById("testDisplay");
        td.innerHTML = "Average Accuracy: " + (avg.accSum / avg.count);
        td.innerHTML += "<br/>Sample Size: " + avg.count;

        avg.accSum = 0.0;
        avg.latSum = 0.0;
        avg.longSum = 0.0;
        avg.count = 0.0;
    }

    function onTimeoutChange() {
        var to = document.getElementById("timeout");
        geoOptions.timeout = to.value;
    }

    function onMaximumAgeChange() {
        var to = document.getElementById("maximumAge");
        geoOptions.maximumAge = to.value;
    }

    function onHighAccuracyChange() {
        //alert("high accuracy change!");
        var ha = document.getElementById("highAccuracy");
        geoOptions.enableHighAccuracy = !geoOptions.enableHighAccuracy;
    }

// Interface

    function showMap(position) {
        var googleLatAndLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var mapOptions = {
            zoom: 15,
            center: googleLatAndLong,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // Enable the visual refresh
        google.maps.visualRefresh = true;

        var mapDiv = document.getElementById("mapview");
        map = new google.maps.Map(mapDiv, mapOptions);

        addMarker(map, googleLatAndLong, "Your Location", "Latitude = " + position.coords.latitude +
                ", Longitude = " + position.coords.longitude);

    }

    function addMarker(map, latlong, title, content) {
        var markerOptions = {
            position: latlong,
            map: map,
            title: title,
            clickable: true
        };

        // using global var so can update position in another function
        marker = new google.maps.Marker(markerOptions);

        var infoWindowOptions = {
            content: content,
            position: latlong
        };

        var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

        google.maps.event.addListener(marker, "click", function() {
            infoWindow.open(map);
        });
    }

    function scrollMapToPosition(coords) {
        var latlong = new google.maps.LatLng(coords.latitude, coords.longitude);

        map.panTo(latlong);
        marker.setPosition(latlong);
    }

    function displayAccuracyProgress(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var accuracy = position.coords.accuracy;


        var p = document.getElementById("progress");
        p.innerHTML += ".";

        avg.count++;
        avg.accSum += accuracy;
        avg.latSum += latitude;
        avg.longSum += longitude;

    }

    function clearAccuracyProgress() {
        var p = document.getElementById("progress");
        p.innerHTML = "Progress:  ";
    }

    function displayStatus(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var pd = document.getElementById("pointDisplay");
        pd.innerHTML = "You are at Latitude: " + latitude + ", Longitude: " + longitude;

        var accuracy = position.coords.accuracy;
        var ad = document.getElementById("accuracyDisplay");
        ad.innerHTML = "Presently, accuracy is " + accuracy + " meters";

        avg.count++;
        avg.accSum += accuracy;
        avg.latSum += latitude;
        avg.longSum += longitude;

        scrollMapToPosition(position.coords);

    }

// Geolocation helper functions

    function computeDistance(startCoords, destCoords) {
        var startLatRads = degreesToRadians(startCoords.latitude);
        var startLongRads = degreesToRadians(startCoords.longitude);
        var destLatRads = degreesToRadians(destCoords.latitude);
        var destLongRads = degreesToRadians(destCoords.longitude);

        var earthRadius = 6731; // in km
        /* From "Head First HTML5 Programming" page 180 */
        var distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) + Math.cos(startLatRads) * Math.cos(destLatRads) * Math.cos(startLongRads - destLongRads)) * earthRadius;

        return distance;
    }

    function degreesToRadians(degrees) {
        var radians = (degrees * Math.PI) / 180;
        return radians;
    }

// Error Functions

    function displayError(error) {
        var errorTypes = {
            0: "Unknown error",
            1: "Permission denied by user",
            2: "Position is not available",
            3: "Request timed out"
        };
        var errorMessage = errorTypes[error.code];
        if (error.code === 0 || error.code === 2) {
            errorMessage = errorMessage + " " + error.message;
        }
        var div = document.getElementById("errorMsg");
        div.innerHTML = errorMessage;
    }

    return pfGPS;

})();
