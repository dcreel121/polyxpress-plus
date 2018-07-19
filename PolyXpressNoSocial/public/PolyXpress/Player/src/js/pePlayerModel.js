/**
 * @module pePlayerModel
 * @name pePlayerModel
 * @exports pePlayerModel
 * @requires mhLog
 * @version 0.1 [June 1, 2014]
 * @author Michael Haungs
 * @copyright Copyright 2012 Michael Haungs [mhaungs at calpoly.edu]
 * @license MIT
 * @desc Local data model.  Holds all the story, chapter, and event data
 * downloaded from the server.
 */

    // quick reminder of jsdoc tags:  @todo, @this, @public, @private, @desc, @constant

    // Begin Module Header
(function (container) {
    // End Module Header

    /**
     * By declaring these object containers here, they are captured in the
     * closure of the function assigned to container.exports.  Therefore,
     * all references to this module will get returned a function that when
     * executed will return the same object.
     */
    var pePlayerModel = {};
    pePlayerModel.test = {};

    /**
     * Assigning exports like this allows dependency injection
     * (aka var sample = require("./sample.js")(app);)
     */
    container.exports = function (pePC, config) {  // Passing a reference to pePlayerController to prevent circular requires

        /*
         * Configuration
         */
        "use strict"; // EMCAScript 5 pragma to catch more javascript errors
        var mhLog = config.mhLog;

        /*
         *********** Imports ********************
         */

        /*
         *********** data members ***************
         */

        /**
         * @desc Local cache of stories.
         * @public
         */
        pePlayerModel.storyMap = [];
        /**
         * @desc Local cache of chapters.
         * @public
         */
        pePlayerModel.chapterMap = [];
        /**
         * @desc Local cache of events.
         * @public
         */
        pePlayerModel.eventMap = [];
        /**
         * @desc Local cache of feeds.
         * @public
         */
         pePlayerModel.feedMap = [];

        /*
         ************ Adding *************
         */

        /**
         * @public
         * @desc Add a story object to the local cache
         * @param {story} item a JSON story object
         * @returns {undefined}
         */
        pePlayerModel.addStory = function (item) {
            mhLog.log(mhLog.LEVEL.DEBUG, "Adding story to model map: " + item.title);
            pePlayerModel.storyMap.push(item);
        };

        /**
         * @public
         * @desc Add a chapter object to the local cache
         * @param {chapter} item a JSON chapter object
         * @returns {undefined}
         */
        pePlayerModel.addChapter = function (item) {
            pePlayerModel.chapterMap.push(item);
            item.openPanel = pePC.getChapterOpenPanelFunction();
        };

        /**
         * @public
         * @desc Add an event object to the local cache
         * @param {event} item
         */
        pePlayerModel.addEvent = function (item) {
            pePlayerModel.eventMap.push(item);
            item.openPanel = pePC.getEventOpenPanelFunction();
        };

         /**
         * @public
         * @desc Add a feed object to the local cache
         * @param {feed} item
         */
        pePlayerModel.addFeed = function (item) {
            pePlayerModel.feedMap.push(item);
            item.openPanel = pePC.getEventOpenPanelFunction();
        };

        /*
         * Populate data structures using provided Array.
         */

        /**
         * @public
         * @desc Add an array of stories to local cache
         * @param stories
         * @returns {undefined}
         */
        pePlayerModel.populateStoryMap = function (stories) {
            pePlayerModel.storyMap = [];
            return populateMap(pePlayerModel.storyMap, stories);
        };

        /**
         * @public
         * @desc Add an array of chapters to local cache
         * @param chapters
         * @returns {undefined}
         */
        pePlayerModel.populateChapterMap = function (chapters) {
            pePlayerModel.chapterMap = [];
            return populateMap(pePlayerModel.chapterMap, chapters);
        };

        /**
         * @public
         * @desc Add an array of events to local cache
         * @param events
         * @returns {undefined}
         */
        pePlayerModel.populateEventMap = function (events) {
            pePlayerModel.eventMap = [];
            return populateMap(pePlayerModel.eventMap, events);
        };

        /**
         * @public
         * @desc Add an array of feeds to local cache
         * @param feeds
         * @returns {undefined}
         */
        pePlayerModel.populateFeedMap = function (feeds) {
            pePlayerModel.feedMap = [];
            return populateMap(pePlayerModel.feedMap, events);
        };

        /*
         ************ Finding *************
         */

        /**
         * @public
         * @desc Find a story by ID.
         * @param {database id} id
         * @returns {undefined}
         */
        pePlayerModel.findStoryByID = function (id) {
            return findByID(pePlayerModel.storyMap, id);
        };

        /**
         * @public
         * @desc Find a chapter by ID.
         * @param {database id} id
         * @returns {undefined}
         */
        pePlayerModel.findChapterByID = function (id) {
            mhLog.log(mhLog.LEVEL.DEBUG, 'CHAPTER MAP: ' + JSON.stringify(pePlayerModel.chapterMap));
            return findByID(pePlayerModel.chapterMap, id);
        };

        /**
         * @public
         * @desc Find an event by ID.
         * @param {database id} id
         * @returns {undefined}
         */
        pePlayerModel.findEventByID = function (id) {
            return findByID(pePlayerModel.eventMap, id);
        };

        /**
         * @public
         * @desc Find a feed by ID.
         * @param {database id} id
         * @returns {undefined}
         */
        pePlayerModel.findFeedByID = function (id) {
            return findByID(pePlayerModel.feedMap, id);
        };

        /*
         * Get all Chapters/Events (useful in pePlayerServer for initial download)
         */

        /**
         * @public
         * @desc Get all chapters
         * @returns {Array}
         */
        pePlayerModel.getAllChapters = function () {
            var chapterList = [];
            pePlayerModel.storyMap.map(function (item) {
                mhLog.log(mhLog.LEVEL.DEBUG, "getAllChapters: item = " + item);
                chapterList = chapterList.concat(item.chapterList);
            });
            mhLog.log(mhLog.LEVEL.DEBUG, "getAllChapters: chapterList = " + chapterList);
            return chapterList;
        };

        /**
         * @public
         * @desc Get all events
         * @returns {Array}
         */
        pePlayerModel.getAllEvents = function () {
            var eventList = [];

            pePlayerModel.chapterMap.map(function (item) {
                eventList = eventList.concat(item.eventList);
            });
            return eventList;
        };

        /**
         * @private
         * @desc find the item in the Array "map" associated with the given "id".
         * @param {Array} map - Array containing data.
         * @param {string} id - d of the item to find in the provided array
         * @returns {undefined} 
         */
        function findByID(map, id) {
            var i;
            for (i = 0; i < map.length; i++) {
                if (map[i]._id === id) {
                    return map[i];
                }
            }
            return -1;
        }

        /**
         * @private
         * @desc Add the data provided in "data" to the array "map"
         * @param {Array} map -  Array adding "data" to.
         * @param {Array} data - Array supplying new data.
         * @returns {undefined}
         */
        function populateMap(map, data) {
            data.map(function (item) {
                map.push(item);
            });
        }

        /*
         ************ Removal *************
         */

        /**
         * @public
         * @desc Remove story from cache (need to remove all corresponding chapters/events too.
         * @param {database id} id
         * @returns {undefined}
         */
        pePlayerModel.removeStory = function (id) {
            var eventList, story;
            story = pePlayerModel.storyMap.splice(pePlayerModel.storyMap.indexOf(pePlayerModel.findStoryByID(id)), 1);
            if (story) {
                eventList = depopulateMap(pePlayerModel.chapterMap, story[0].chapterList, true);
                if (eventList) {
                    depopulateMap(pePlayerModel.eventMap, eventList, false);
                }
            }
        };

        /**
         * @private
         * @desc remove the data provided in "data" from "map"
         * @param {array} map
         * @param {array} data
         * @returns {undefined}
         */
        function depopulateMap(map, data, capture) {
            var delItem;
            var list = [];
            data.map(function (item) {
                mhLog.log(mhLog.LEVEL.DEBUG, "Item is " + item);
                delItem = map.splice(map.indexOf(item), 1);
                if (capture) {
                    if (delItem[0]) {
                        list = list.concat(delItem[0].eventList);
                    }
                }
                mhLog.log(mhLog.LEVEL.DEBUG, "Removing " + JSON.stringify(delItem));
            });
            mhLog.log(mhLog.LEVEL.DEBUG, "Remove EventList " + JSON.stringify(list));
            if (capture) {
                return list;
            }
        }

        // Export to other modules
        return pePlayerModel;
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