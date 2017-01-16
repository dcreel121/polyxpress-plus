/**
 * @module pePlayerMapFactory
 * @name pePlayerMapFactory
 * @requires mhLog
 * @version 0.1 [June 1, 2014]
 * @author Michael Haungs
 * @copyright Copyright 2012 Michael Haungs [mhaungs at calpoly.edu]
 * @license MIT
 * @desc Prototypal root for PolyXpress Player maps.
 */

    // quick reminder of jsdoc tags:  @todo, @this, @public, @private, @desc, @constant

    // Begin Module Header
(function (container) {
    // End Module Header

    /*
     * By declaring these object containers here, they are captured in the
     * closure of the function assigned to container.exports.  Therefore,
     * all references to this module will get returned a function that when
     * executed will return the same object.
     */

    container.exports = function (config) {

        /*
         * Configuration
         */
        "use strict";  // EMCAScript 5 pragma to catch more javascript error
        var mhLog = config.mhLog;

        /* jshint validthis:true */

        /*
         * Imports
         */
        var mWL = require("src/js/markerWithLabel")();

        var pePlayerMapFactory = {};
        pePlayerMapFactory.test = {};

        /*
         ************ Private Variables *************
         */

        /**
         * @desc The root map object for PolyXpress Player Map objects.
         * @private
         */
        var baseMapPrototype = {
            // Public Interface
            panToYou           : panToYou,
            panToMarkers       : panToMarkers,
            createMapView      : createMapView,
            itemInRange        : itemInRange,
            updateLocation     : updateLocation,
            getDistanceFromItem: getDistanceFromItem
        };

        /*
         ************ Navigation *************
         */

        /**
         * @private
         * @desc Button handler for panning to your current location
         * @returns {undefined}
         */
        function panToYou() {
            //this.map.setZoom(15);
            this.map.panTo(this.user.getPosition());
        }

        /**
         * @private
         * @desc Button handler for panning to item (chapter or event) locations
         * @returns {undefined}
         */
        function panToMarkers() {
            var i, bounds;

            // display all markers in bounds
            bounds = new google.maps.LatLngBounds(null);
            // add user location!
            bounds = bounds.extend(this.user.getPosition());
            i = this.markers.length;

            while (i > 0) {
                bounds = bounds.extend(this.markers[i - 1].marker.getPosition());
                i--;
            }

            if (!bounds.isEmpty()) {
                this.map.fitBounds(bounds);
                //this.map.panToBounds(bounds);
            }
        }

        /*
         ************ Map Creation *************
         */

        /**
         * @private
         * @desc Creates map with appropriate markers.
         * @param {array} markerList
         * @param {string} canvasID
         * @param {string} iconURL
         * @returns {undefined}
         */
        function createMapView(markerList, canvasID, iconURL, findByID, markerURL) {
            var googleLatAndLong, mapOptions, mapDiv;

            this.markerIcon = markerURL;

            if (typeof this.currentLocation !== "undefined") {
                if (typeof this.map === "undefined") {
                    googleLatAndLong = new google.maps.LatLng(this.currentLocation.lat(), this.currentLocation.lng());

                    // Muted Blue
                    var styleArray = [
                        {"featureType": "all", "stylers": [
                            {"saturation": 0},
                            {"hue": "#e7ecf0"}
                        ]},
                        {"featureType": "road", "stylers": [
                            {"saturation": -70}
                        ]},
                        {"featureType": "transit", "stylers": [
                            {"visibility": "off"}
                        ]},
                        {"featureType": "poi", "stylers": [
                            {"visibility": "off"}
                        ]},
                        {"featureType": "water", "stylers": [
                            {"visibility": "simplified"},
                            {"saturation": -60}
                        ]}
                    ];

                    mapOptions = {
                        zoom              : 15,
                        center            : googleLatAndLong,
                        mapTypeId         : google.maps.MapTypeId.ROADMAP,
                        disableDefaultUI  : true,
                        panControl        : false,
                        zoomControl       : true,
                        mapTypeControl    : false,
                        scaleControl      : true,
                        streetViewControl : false,
                        overviewMapControl: false,
                        rotateControl     : false,
                        styles            : styleArray
                    };

                    // Enable the visual refresh
                    google.maps.visualRefresh = true;

                    mapDiv = document.getElementById(canvasID);

                    this.map = new google.maps.Map(mapDiv, mapOptions);

                    if (this.map) {
                        startSpinner();
                        // Stop Spinner (user visual feedback) after tiles are loaded
                        google.maps.event.addListener(this.map, 'tilesloaded', function () {
                            stopSpinner();
                        });
                    }
                    else {
                        // map evaluates to any false-y value
                        mhLog.log(mhLog.LEVEL.PRODUCTION, "Map not created.");
                    }

                    this.user = createMarker(this.map, googleLatAndLong, "You are here.");
                    this.user.setIcon(iconURL);

                }
            }

            displayMarkers.call(this, markerList, findByID, canvasID);
        }

        /**
         * @private
         * @desc Display provided markers on map
         * @param {Array} markerList
         * @param {function} findByID
         * @param {HTMLElement} canvasID
         * @returns {undefined}
         */
        function displayMarkers(markerList, findByID, canvasID) {
            var tempMarker;

            if (markerList.length > 0) {
                // reset chapter map
                while (this.markers.length > 0) {
                    tempMarker = this.markers.pop();
                    tempMarker.marker.setMap(null);
                    tempMarker.circle.setMap(null);
                }

                // Add all markers to map
                markerList.map(mapMarkers.bind(this, findByID));

                // refresh map
                panToYou.call(this);
            }

            $(canvasID).gmap('refresh');
        }

        /**
         * @private
         * @desc Place markers on the map.
         * @param {Function} findByID
         * @param {database id} id
         * @returns {undefined}
         */
        function mapMarkers(findByID, id) {
            var item = findByID(id);
            var googleLatAndLong, newMarker, newCircle;

            if (item) {
                googleLatAndLong = new google.maps.LatLng(item.proximity.lat, item.proximity.lng);
                newMarker = createMarker(this.map, googleLatAndLong, item.title);  // and, adds it to map
                newMarker.setIcon(this.markerIcon);
                newCircle = createCircle(this.map, googleLatAndLong, item);
                var iw = new google.maps.InfoWindow(
                    {
                        content: "<div class='mapInfoWindow'>" + item.teaser + "</div>"
                    }
                );
                google.maps.event.addListener(newMarker, "click", function (e) {
                    iw.open(this.map, this);
                    item.openPanel();  // open the right panel for this marker
                });

                this.markers.push({marker: newMarker, circle: newCircle});
            }
        }

        /**
         * @private
         * @desc Create a marker for the map.
         * @param {Google map} targetMap
         * @param {LatLng} latlong
         * @param {string} title
         * @returns {markerWithLabel.MarkerWithLabel}
         */
        function createMarker(targetMap, latlong, title) {

            var markerOptions = {
                position    : latlong,
                map         : targetMap,
                labelContent: title,
                labelAnchor : new google.maps.Point(22, 0),
                labelClass  : "labels", // the CSS class for the label
                labelStyle  : {opacity: 0.75},
                labelVisible: true
            };

            return new mWL.MarkerWithLabel(markerOptions);  // Google.map.marker wrapper
        }

        /**
         * @private
         * @desc Draw circle that represents diameter of chapter/page.
         * @param {Google map} targetMap
         * @param {LatLng} latlong
         * @param {chapter || event} item
         * @returns {google.maps.Circle}
         */
        function createCircle(targetMap, latlong, item) {
            var circleOptions = {
                strokeColor  : "#00FF00",
                strokeOpacity: 0.8,
                strokeWeight : 2,
                fillColor    : "#00FF00",
                fillOpacity  : 0.15,
                center       : latlong,
                map          : targetMap,
                radius       : item.proximity.range * 1000
            };

            return new google.maps.Circle(circleOptions);
        }

        /*
         ************ Distance *************
         */

        /**
         * @private
         * @desc Calculates if an item is within range of the user
         * @param {item object} item  (must have a "proximity" member; aka proximity interface)
         * @returns {Boolean}
         */
        function itemInRange(item) {
            var distance, googleLatAndLong;

            // NOTE:  For testing on laptop, commented this out.  Works!
            if (this.currentLocation !== -1) {
                googleLatAndLong = new google.maps.LatLng(item.proximity.lat, item.proximity.lng);
                distance = computeDistance(googleLatAndLong, this.currentLocation);

                // is the event in range?
                if (distance < item.proximity.range) {
                    return true;
                }
                else {
                    return false;
                }
            }

            // Default answer if currentLocation is not defined
            return true;
        }

        /**
         * @private
         * @desc Updates the maps current location information.
         * @param {position} cloc
         */
        function updateLocation(cloc) {
            this.currentLocation = cloc;

            if (typeof this.user !== "undefined") {  // User marker on "Chapter" map
                this.user.setPosition(this.currentLocation);
            }
        }

        /**
         * @private
         * @desc Calculates distance to an item
         * @param {item object} item  (must have a "proximity" member; aka proximity interface)
         * @returns {number}
         */
        function getDistanceFromItem(item) {
            var distance, googleLatAndLong;

            // NOTE:  For testing on laptop, commented this out.  Works!
            if (this.currentLocation !== -1) {
                googleLatAndLong = new google.maps.LatLng(item.proximity.lat, item.proximity.lng);
                distance = computeDistance(googleLatAndLong, this.currentLocation);

                // is the event in range?
                return (distance - item.proximity.range).toFixed(2);
            }

            return -1;

        }

        /**
         * @private
         * @desc Compute the distance between two coordinates.
         * @param {LatLng} startCoords
         * @param {LatLng} destCoords
         * @returns {number}
         */
        function computeDistance(startCoords, destCoords) {
            var distance;

            if (startCoords && destCoords) {
                var startLatRads = degreesToRadians(startCoords.lat());
                var startLongRads = degreesToRadians(startCoords.lng());
                var destLatRads = degreesToRadians(destCoords.lat());
                var destLongRads = degreesToRadians(destCoords.lng());

                var earthRadius = 6731; // in km
                /* From "Head First HTML5 Programming" page 180 */
                distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) + Math.cos(startLatRads) * Math.cos(destLatRads) * Math.cos(startLongRads - destLongRads)) * earthRadius;
            }
            else {
                /* Sometimes the map is slow in displaying, so coords are undefined.  In this case,
                 * return a really large number to indicate the error.  When the player moves this should
                 * update correctly.
                 */
                distance = Infinity;
            }
            return distance;
        }

        /**
         * @private
         * @desc Converts degrees to radians.
         * @param {number} degrees
         * @returns {number}
         */
        function degreesToRadians(degrees) {
            var radians = (degrees * Math.PI) / 180;
            return radians;
        }

        /*
         ************ Utility Methods *************
         */

        /**
         * @private
         * @desc Starts the page loading widget. Ref: http://api.jquerymobile.com/page-loading/
         * @returns {undefined}
         */
        function startSpinner() {
            mhLog.log(mhLog.LEVEL.DEVELOPMENT, "START SPINNER");
            $.mobile.loading('show', {
                text       : $.mobile.loader.prototype.options.text,
                textVisible: $.mobile.loader.prototype.options.textVisible,
                theme      : $.mobile.loader.prototype.options.theme,
                textonly   : false,
                html       : $.mobile.loader.prototype.options.html
            });
        }

        /**
         * @private
         * @desc Stops the page loading widget.
         * @returns {undefined}
         */
        function stopSpinner() {
            mhLog.log(mhLog.LEVEL.DEVELOPMENT, "STOP SPINNER");
            $.mobile.loading('hide');
        }

        /*
         ************ Public Factory Method *************
         */

        /**
         * @public
         * @desc Factory that creates Google maps.
         * @returns {baseMapPrototype}
         */
        pePlayerMapFactory.makeMap = function () {
            var newMap;

            var mapProps = {
                user           : {value: undefined, writable: true, enumerable: true},
                map            : {value: undefined, writable: true, enumerable: true},
                currentLocation: {value: undefined, writable: true, enumerable: true},
                markers        : {value: [], writable: true, enumerable: true},
                markerIcon     : {value: "http://maps.google.com/mapfiles/kml/pal3/icon54.png", writable: true, enumerable: true}
            };

            newMap = Object.create(baseMapPrototype, mapProps);

            return newMap;
        };

        // Export to other modules
        return pePlayerMapFactory;

    };

    // Begin Module Footer
})(getGlobalContainer());
// End Module Footer

/**
 * @private
 * @desc If this is in a browser, then need to create/use a global variable
 * to hold module exports.  If this is in Node, use module.exports.
 * @returns {global object}
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