/**
 * @module peDM
 *
 * @requires mhLog
 *
 * @description Handles local representation of data.  It is updated by peDesignerServer
 * and accessed by peDesignerController.
 *
 * @summary Controller for peDesigner.
 *
 * @copyright Michael Haungs, 2012
 * @license MIT
 *
 * @author Michael Haungs
 */

// Begin Module Header
(function(container) {
// End Module Header

    /** @alias module:peDM */
    var peDM = {};  // Exported Container and test container
    peDM.test = {};

    // Assigning exports like this allows dependency injection (aka var sample = require("./sample.js")(app);)
    container.exports = function(config) {

        "use strict"; // EMCAScript 5 pragma to catch more javascript errors
        var mhLog = config.mhLog;

        /** Locally caches story data */
        peDM.storyMap = [];
        /** Locally caches story data */
        peDM.chapterMap = [];
        /** Locally caches event data */
        peDM.eventMap = [];

        /**
         * Find story by id.
         * @param {String} id
         * @returns {Story} story
         */
        peDM.findStoryByID = function(id) {
            return findByID(peDM.storyMap, id);
        };
        
        /**
         * Find chapter by id.
         * @param {type} id
         * @returns {Chapter} chapter
         */
        peDM.findChapterByID = function(id) {
            return findByID(peDM.chapterMap, id);
        };

        /**
         * Find event by id.
         * @param {type} id
         * @returns {Event} id
         */
        peDM.findEventByID = function(id) {
            return findByID(peDM.eventMap, id);
        };

        function findByID(map, id) {
            var i;

            for (i = 0; i < map.length; i++) {
                if (map[i]._id === id)
                    return map[i];
            }
        }

        /**
         * Updates story in local cache.
         * @param {Story} story
         * @returns {undefined}
         */
        peDM.updateStory = function(story) {
            return updateItem(peDM.storyMap, story);
        };

        /**
         * Updates chapter in local cache.
         * @param {Chapter} chapter
         * @returns {undefined}
         */
        peDM.updateChapter = function(chapter) {
            return updateItem(peDM.chapterMap, chapter);
        };

        /**
         * Updates event in local cache.
         * @param {Event} event
         * @returns {undefined}
         */
        peDM.updateEvent = function(event) {
            return updateItem(peDM.eventMap, event);
        };

        function updateItem(map, item) {
            var i;
            var id = item._id;

            for (i = 0; i < map.length; i++) {
                if (map[i]._id === id)
                    map[i] = item;
            }

        }

        /**
         * Deletes story by id.
         * @param {String} storyID
         * @returns {undefined}
         */
        peDM.deleteStory = function(storyID) {
            return deleteItem(peDM.storyMap, storyID);
        };

        /**
         * Deletes chapter by id.
         * @param {String} chapterID
         * @returns {undefined}
         */
        peDM.deleteChapter = function(chapterID) {
            return deleteItem(peDM.chapterMap, chapterID);
        };

        /**
         * Deletes event by id.
         * @param {String} eventID
         * @returns {undefined}
         */
        peDM.deleteEvent = function(eventID) {
            return deleteItem(peDM.eventMap, eventID);
        };

        function deleteItem(map, id) {
            var i;

            for (i = 0; i < map.length; i++) {
                if (map[i]._id === id) {
                    map.splice(i, 1);
                    break;
                }
            }
        }

        /**
         * Populates local story cache from provided Array.
         * @param {Array} stories
         * @returns {undefined}
         */
        peDM.populateStoryMap = function(stories) {
            peDM.storyMap = [];
            return populateMap(peDM.storyMap, stories);
        };

        /**
         * Populates local chapter cache from provided Array.
         * @param {Array} chapters
         * @returns {undefined}
         */
        peDM.populateChapterMap = function(chapters) {
            peDM.chapterMap = [];
            return populateMap(peDM.chapterMap, chapters);
        };

        /**
         * Populates local event cache from provided Array.
         * @param {Array} events
         * @returns {undefined}
         */
        peDM.populateEventMap = function(events) {
            peDM.eventMap = [];
            return populateMap(peDM.eventMap, events);
        };

        function populateMap(map, data) {
            var i = 0;

            data.map(function(item) {
                map.push(item);
            });
        }

        // Export to other modules
        return peDM;
    };
// Begin Module Footer
})(getGlobalContainer());
// End Module Footer

/*
 * If this is in a browser, then need to create/use a global variable
 * to hold module exports.  If this is in Node, use module.exports.
 * @returns {}
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