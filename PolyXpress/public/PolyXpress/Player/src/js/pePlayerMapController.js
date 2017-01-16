/**
 * @module pePlayerMapController
 * @name pePlayerMapController
 * @exports pePlayerMapController
 * @requires pePlayerModel
 * @requires pePlayerController
 * @requires pePlayerMapFactory
 * @requires mhLog
 * @requires mhGeo
 * @version 0.1 [June 1, 2014]
 * @author Michael Haungs
 * @copyright Copyright 2012 Michael Haungs [mhaungs at calpoly.edu]
 * @license MIT
 * @desc Acts as the controller for the map gui.
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
    var pePlayerMapController = {};
    pePlayerMapController.test = {};

    /*
     * Assigning exports like this allows dependency injection
     * (aka var sample = require("./sample.js")(app);)
     */
    container.exports = function (pePC, pePM, config) {

        /*
         * Configuration
         */
        "use strict"; // EMCAScript 5 pragma to catch more javascript error
        var mhLog = config.mhLog;

        /*
         * Imports
         */
        var chapterGeo = require("src/lib/mhGeo/mhGeo")(mhLog);
        var eventGeo = require("src/lib/mhGeo/mhGeo")(mhLog);
        var pePMapF = require("src/js/pePlayerMapFactory")(config);

        /*
         * private variables
         */

        /**
         * @desc Map object for chapter map.
         * @private
         */
        var chapterMap = pePMapF.makeMap();

        /**
         * @desc Map object for event map.
         * @private
         */
        var eventMap = pePMapF.makeMap();

        /*
         ************ Testing hacks *************
         */

        // @todo Eventually, need to change mhGeo.js so that accounts for unusual jumps in position.
        // At this stage, just setting minAccuracy high so that does not use the correcting feature
        // in mhGeo.js
        chapterGeo.setMinAccuracy(50000);
        eventGeo.setMinAccuracy(50000);

        /*
         ************ Initialization Events *************
         */

        /*
         * Map initialization (via jquery mobile events)
         */

        $(document).on("pageshow", "#mapViewChapters", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "PageShow:  mapViewChapters");
            chapterGeo.startWatch(initChapterMap, chapterLocationEventHandler);
            google.maps.event.trigger(map_canvas, 'resize');
        });

        $(document).on("pagehide", '#mapViewChapters', function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "PageHide:  mapViewChapters");
            chapterGeo.stopWatch();
        });

        $(document).on("pageshow", "#mapViewEvents", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "PageShow:  mapViewEvents");
            eventGeo.startWatch(initEventMap, eventLocationEventHandler);
            google.maps.event.trigger(map_canvas2, 'resize');
        });

        $(document).on("pagehide", '#mapViewEvents', function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "PageHide:  mapViewEvents");
            eventGeo.stopWatch();
        });

        /*
         ************ User controls *************
         */

        /**
         * @public
         * @desc Button handler for panning to your current location.
         * @returns {undefined}
         */
        pePlayerMapController.mapViewChaptersYourLocation = function () {
            chapterMap.panToYou();
        };

        /**
         * @public
         * @desc Button handler for panning to chapter locations.
         * @returns {undefined}
         */
        pePlayerMapController.mapViewChaptersChapterLocation = function () {
            chapterMap.panToMarkers();
        };

        /**
         * @public
         * @desc Button handler for panning to your current location.
         * @returns {undefined}
         */
        pePlayerMapController.mapViewEventsYourLocation = function () {
            eventMap.panToYou();
        };

        /**
         * @public
         * @desc Button handler for panning to event locations.
         * @returns {undefined}
         */
        pePlayerMapController.mapViewEventsEventLocation = function () {
            eventMap.panToMarkers();
        };

        /*
         ************ Distance functions *************
         */

        /**
         * @public
         * @desc Calculates if an event is within range of the user.
         * @param {Event} event
         * @returns {boolean}
         */
        pePlayerMapController.eventInRange = function (event) {
            return eventMap.itemInRange(event);
        };

        /**
         * @public
         * @desc Calculates if a chapter is within range of the user.
         * @param {Event} event
         * @returns {boolean}
         */
        pePlayerMapController.chapterInRange = function (chapter) {
            return chapterMap.itemInRange(chapter);
        };

        /**
         * @public
         * @desc Calculates distance from an event.
         * @param {Event} event
         * @returns {boolean}
         */
        pePlayerMapController.getDistanceFromEvent = function (event) {
            return eventMap.getDistanceFromItem(event);
        };

        /**
         * @public
         * @desc Calculates distance from a chapter.
         * @param {Event} event
         * @returns {boolean}
         */
        pePlayerMapController.getDistanceFromChapter = function (chapter) {
            return chapterMap.getDistanceFromItem(chapter);
        };

        /*
         ************ User Tracking *************
         */

        /**
         * @private
         * @desc geolocation watch handler to track user position
         * @param {position object} position
         * @returns {undefined}
         */
        function initChapterMap(position) {
            var currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            chapterMap.updateLocation(currentLocation);
            var story = pePM.findStoryByID(pePC.getCurrentStoryID());
            chapterMap.createMapView(story.chapterList, "map_canvas", "http://google.com/mapfiles/ms/micons/man.png",
                                     pePM.findChapterByID, "http://maps.google.com/mapfiles/kml/pal4/icon0.png");
        }

        /**
         * @private
         * @desc geolocation watch handler to track user position
         * @param {position object} position
         * @returns {undefined}
         */
        function initEventMap(position) {
            var currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            eventMap.updateLocation(currentLocation);
            var chapter = pePM.findChapterByID(pePC.getCurrentChapterID());
            eventMap.createMapView(chapter.eventList, "map_canvas2", "http://google.com/mapfiles/ms/micons/man.png",
                                   pePM.findEventByID, "http://maps.google.com/mapfiles/kml/pal3/icon54.png");
        }

        /**
         * @private
         * @desc Geolocation watch handler to track user position on Chapter map
         * @param {position object} position
         * @returns {undefined}
         */
        function chapterLocationEventHandler(position) {
            var currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            chapterMap.updateLocation(currentLocation);  // positions user correctly on map
            pePC.updateChapterLocation(currentLocation);
        }

        /**
         * @private
         * @desc Geolocation watch handler to track user position and proximity to events
         * @param {position object} position
         * @returns {undefined}
         */
        function eventLocationEventHandler(position) {
            var currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            pePC.updateGPSIndicator(eventGeo.getAverageAccuracy());
            eventMap.updateLocation(currentLocation);
            pePC.updateEventLocation(currentLocation);
        }

        return pePlayerMapController;

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