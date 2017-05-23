/**
 * @module pePlayerServer
 * @name pePlayerServer
 * @exports pePlayerServer
 * @requires pePlayerModel
 * @requires mhLog
 * @version 0.1 [June 1, 2014]
 * @author Michael Haungs
 * @copyright Copyright 2012 Michael Haungs [mhaungs at calpoly.edu]
 * @license MIT
 * @desc Handles all communication with PolyXpress Server.  This is
 * the controller for the remote data Model, but serves as the "remote" data
 * model for the client web app.  Clear as mud?
 *
 * Story, chapter, and event data is modified in the player for tracking purposes.  This is not
 * an issue because the player never sends updates to the server.  If did, would need to remove the
 * added fields before updating the server.
 *
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
    var pePlayerServer = {};
    pePlayerServer.test = {};

    /*
     * Assigning exports like this allows dependency injection
     * (aka var sample = require("./sample.js")(app);)
     */
    container.exports = function (pePM, config) {

        /*
         * Configuration
         */
        "use strict"; // EMCAScript 5 pragma to catch more javascript errors
        var mhLog = config.mhLog;

        /*
         * Imports
         */

        /*
         ************ Authentication *************
         */

        /**
         * @public
         * @desc Check to see if the user is authenticated
         * @param {function} setCheckAuthCallback
         * @returns {undefined}
         */
        pePlayerServer.checkAuth = function (setCheckAuthCallback) {
            var request = new XMLHttpRequest();
            request.onload = function () {
                if (request.status === 200) {
                    var authData = JSON.parse(request.responseText);
                    mhLog.log(mhLog.LEVEL.DEVELOPMENT, "checkAuth: " + JSON.stringify(authData));
                    setCheckAuthCallback(authData);
                    return;
                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Checking user authorization failed with error code: " + request.status);
                }
            };
            request.open("GET", "/peAPI/user/checkAuth");
            request.send(null);
        };

        /*
         ************ Author *************
         */

        /**
         * @public
         * @desc Updates author information (reading,completed lists in DB)
         * @param {Object} author
         * @returns {undefined}
         */
        pePlayerServer.updateAuthor = function (author) {
            updateAuthorInformation(author);
        };

        /**
         * @public
         * @desc getAuthorData: Retrieves all data (usƒfeeer, stories, chapters, and events)
         * associated with logged in user.
         * @param {function} setAuthorCallback - display author information on main menu
         * @param {function} setDisplayCallback - display found stories on main view
         * @returns {undefined}
         */
        pePlayerServer.getAuthorData = function (setAuthorCallback, setDisplayCallback) {
            /*getAuthorInformation(setAuthorCallback,
                                 getAllStories.bind(undefined,
                                                    getAllChapters.bind(undefined,
                                                                        getAllEvents.bind(undefined,
                                                                                          setDisplayCallback))));*/
            // useAuthorData, populateStoryList
            getAuthorInformation(setAuthorCallback, getAllStories.bind(undefined, setDisplayCallback));
        };

        /**
         * @private
         * @desc Retrieves logged in user's account data
         * @param {function} setAuthorCallback - display author information on main menu
         * @param {function} next - next callback function to invoke
         * @returns {undefined}
         */
        function getAuthorInformation(setAuthorCallback, next) {
            var request = new XMLHttpRequest();
            request.onload = function () {
                var user;
                var totalStoryList;
                if (request.status === 200) {
                    user = JSON.parse(request.responseText);
                    setAuthorCallback(user);
                    if (user.readingList.length !== 0 || user.authorList !== 0) {
                        // Starts the chain of reading all the story a user is reading
                        mhLog.log(mhLog.LEVEL.DEVELOPMENT, "User Reading List: " + user.readingList);
                        mhLog.log(mhLog.LEVEL.DEVELOPMENT, "User Author List: " + user.authorList);
                        // Save the total number of stories so can update display only after all of the
                        // stories have loaded.
                        totalStoryList = user.readingList.concat(user.authorList);
                        next(totalStoryList);
                    }
                    return;
                }
                else {
                    handleRetrievalError("getAuthorInformation: Getting author data failed with error code: " + request.status, true);
                }
            };
            request.open("GET", "/peAPI/user/self");
            request.send(null);
        }

        /**
         * @private
         * @desc Sends updated author information to server to be persisted
         * @param {user} author
         * @returns {undefined}
         */
        function updateAuthorInformation(author) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        var user = JSON.parse(request.responseText);
                        mhLog.log(mhLog.LEVEL.DEBUG, "Successful Author Update." + user.name);
                    }
                    else {
                        mhLog.log(mhLog.LEVEL.PRODUCTION, "Error:  Author Update failed");
                    }
                }
            };
            request.open("PUT", "/peAPI/user/" + author._id);
            request.setRequestHeader("Content-Type", "application/json");
            request.send(JSON.stringify(author));
        }


        /*
         ************ Session *************
         */

        /**
         * @public
         * @desc Mark chapter as completed in the user's session.
         * @param {chapter} chapter
         * @returns {undefined}
         */
        pePlayerServer.markChapterCompleted = function (chapter) {
            mhLog.log(mhLog.LEVEL.DEVELOPMENT, "In pePlayerServer.markChapterCompleted " + chapter._id);
            markChapterCompleted(chapter._id);
        };

        /**
         * @public
         * @desc Mark event as completed in user's session.
         * @param {event} event
         * @returns {undefined}
         */
        pePlayerServer.markEventCompleted = function (event) {
            mhLog.log(mhLog.LEVEL.DEVELOPMENT, "In pePlayerServer.markEventCompleted " + event._id);
            markEventCompleted(event._id);
        };

        /**
         * @private
         * @desc Mark chapter as completed in the user's session.
         * @param {chapter} chapter
         * @returns {undefined}
         */
        function markChapterCompleted(cid) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        var msg = JSON.parse(request.responseText);
                        mhLog.log(mhLog.LEVEL.DEBUG, "Chapter successfully marked as completed. " + msg);
                    }
                    else {
                        mhLog.log(mhLog.LEVEL.PRODUCTION, "Error:  Marking chapter complete failed. ");
                    }
                }
            };
            request.open("PUT", "/peAPI/session/complete/chapter/" + cid);
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(cid);
        }

        /**
         * @private
         * @desc Mark event as completed in user's session.
         * @param {event} event
         * @returns {undefined}
         */
        function markEventCompleted(eid) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        var msg = JSON.parse(request.responseText);
                        mhLog.log(mhLog.LEVEL.DEBUG, "Event successfully marked as completed. " + msg);
                    }
                    else {
                        mhLog.log(mhLog.LEVEL.PRODUCTION, "Error:  Marking event complete failed. ");
                    }
                }
            };
            request.open("PUT", "/peAPI/session/complete/event/" + eid);
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(eid);
        }

        /*
         ************ Story *************
         */

        /**
         * @public
         * @desc Retrieve the list of stories recently added to PolyXpress (appears in Store)
         * @param {function} setRecentDisplayCallback - function that displays stories in Recent list.
         * @returns {undefined}
         */
        pePlayerServer.getRecentStories = function (setRecentDisplayCallback) {
            getRecentStories(setRecentDisplayCallback);
        };

        /**
         * @public
         * @desc Search for a story that contains the provided term
         * @param {string} keyword
         * @param setKeywordSearchCallback
         * @returns {undefined}
         */
        pePlayerServer.keywordSearch = function (keyword, setKeywordSearchCallback) {
            if (keyword) {
                //alert("You entered: " + keyword + "\nKeyword search not implemented.");
                getStoriesByKeyword(keyword, setKeywordSearchCallback);
            }
        };

        /**
         * @public
         * @desc Retrieve all the information for a given story
         * @param {database id} id
         * @returns {undefined}
         * @param setDisplayCallback
         */
        pePlayerServer.getStory = function (id, setDisplayCallback) {
            getSingleStory(id,
                           getAllStories.bind(undefined,
                                              getAllChapters.bind(undefined,
                                                                  getAllEvents.bind(undefined,
                                                                                    setDisplayCallback))));
        };

        /**
         * @private
         * @desc Add story looking for to an array so can use "getAllStories" to get.
         * @param {database id} id
         * @param {function} next
         * @returns {undefined}
         */
        function getSingleStory(id, next) {
            var tempArray = [];
            tempArray.push(id);
            next(tempArray);
        }

        /**
         * @private
         * @desc Recursively retrieve story data.  Assuming not called if slist empty.
         * @param {function} next - function to retrieve chapter data
         * @param {array} slist - list of stories to load
         * @returns {undefined}
         */
        function getAllStories(next, slist) {
            var request = new XMLHttpRequest();
            request.onload = function () {
                var story;
                if (request.status === 200) {
                    story = JSON.parse(request.responseText);
                    //pePM.storyMap.push(story);
                    pePM.addStory(story);
                    // prefetch story overview image.  Will prefetch more of the
                    // story once it is actually started.
                    prefetchStoryOverviewImage(story);
                    // recursively retreiving stories (slist was popped)
                    getAllStories(next, slist);
                }
                else if (request.status === 404) {
                    mhLog.log(mhLog.LEVEL.DEBUG, "Skipping Story...");
                    // recursively retreiving stories (slist was popped)
                    getAllStories(next, slist);
                }
                else {
                    handleRetrievalError("getAllStories: Error retrieving user stories.", true);
                }
            };
            // Need to make sure slist.pop() is not undefined.
            if (slist.length > 0) {
                request.open("GET", "/peAPI/story/" + slist.pop());
                request.send(null);
            } else {
                mhLog.log(mhLog.LEVEL.PRODUCTION, "pePS.getAllStories: Stories all done.");
                next(pePM.getAllChapters());
                //next();
            }
        }

        /**
         * @private
         * @desc Retrieve 15 most recent stories from database.
         * @param {function} displayCallback
         * @returns {undefined}
         */
        function getRecentStories(displayCallback) {
            var request = new XMLHttpRequest();
            request.onload = function () {
                var stories;
                if (request.status === 200) {
                    stories = JSON.parse(request.responseText);
                    //pePM.storyMap.push(story);
                    if (stories) {
                        displayCallback(stories);
                    }

                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Error retrieving user stories.");
                }
            };
            request.open("GET", "/peAPI/story/recent");
            request.send(null);
        }

        /**
         * @private
         * @desc Retrieve stories that contain the keyword from server
         * @param {string} keyword
         * @param {function} displayCallback
         * @returns {undefined}
         */
        function getStoriesByKeyword(keyword, displayCallback) {
            var request = new XMLHttpRequest();
            request.onload = function () {
                var stories;
                if (request.status === 200) {
                    stories = JSON.parse(request.responseText);
                    //pePM.storyMap.push(story);
                    if (stories) {
                        displayCallback(stories);
                        //mhLog.log(mhLog.LEVEL.DEBUG, request.responseText);
                    }

                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Error retrieving stories by keyword.");
                }
            };
            request.open("GET", "/peAPI/story/keyword/" + keyword);
            request.send(null);
        }

        /*
         ************ Chapter *************
         */

        /**
         * @private
         * @desc Recursively retrieve chapter data.
         * @param {function} next - function to retrieve event data.
         * @param {array} clist - List of chapters to load. Assuming not called if clist empty.
         * @returns {undefined}
         */
        function getAllChapters(next, clist) {
            var request = new XMLHttpRequest();
            mhLog.log(mhLog.LEVEL.DEBUG, "getAllChapters: chapterList = " + clist);
            request.onload = function () {
                var chapter;
                if (request.status === 200) {
                    chapter = JSON.parse(request.responseText);
                    chapter.found = false;  // Used to track when in range
                    //pePM.chapterMap.push(chapter);
                    pePM.addChapter(chapter);
                    mhLog.log(mhLog.LEVEL.DEBUG, "Just got the chapter: " + JSON.stringify(chapter));
                    // recursively retreiving chapters (clist was popped)
                    getAllChapters(next, clist);
                }
                else if (request.status === 404) {
                    mhLog.log(mhLog.LEVEL.DEBUG, "Skipping Chapter...");
                    // recursively retreiving chapters (clist was popped)
                    getAllChapters(next, clist);
                }
                else {
                    handleRetrievalError("getAllChapters: Error retrieving user chapters.", true);
                }
            };
            // Need to make sure clist.pop() is not undefined.
            if (clist.length > 0) {
                request.open("GET", "/peAPI/chapter/" + clist.pop());
                request.send(null);
            } else {
                mhLog.log(mhLog.LEVEL.PRODUCTION, "pePS.getAllChapters: Chapters all done.");
                next(pePM.getAllEvents());
            }
        }

         pePlayerServer.saveComment = function(comment, displayCallback) {
            var request = new XMLHttpRequest();
            request.onload = function() {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        var comment = JSON.parse(request.responseText);
                        displayCallback(comment);
                    }
                    else {
                        mhLog.log(mhLog.LEVEL.PRODUCTION, "Error saving story comment");
                    }
                }
            };

            request.open("POST", "/peAPI/comments");
            request.setRequestHeader("Content-Type", "application/json");

            request.send(JSON.stringify(comment));
        };

        pePlayerServer.getChapterComments = function(chapterId, displayCallback) {
            var request = new XMLHttpRequest();
            request.onload = function() {
                var comments;
                if (request.status === 200) {
                    comments = JSON.parse(request.responseText);
                    if (comments) {
                        displayCallback(comments);
                    }
                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Error retrieving story comments");
                }
            };

            request.open("GET", "/peAPI/comments/chapter/" + chapterId);
            request.send(null);
        };

        pePlayerServer.submitDeleteComment = function(id) {
            var request = new XMLHttpRequest();

            request.onload = function() {
                var commentID;
                if (request.status === 200) {
                    commentID = JSON.parse(request.responseText);
                    mhLog.log(mhLog.LEVEL.DEBUG, "Deleted comment " + commentID);
                }
                else {
                    //displayDeleteByError();
                }
            };

            request.open("DELETE", "/peAPI/comments/" + id);
            request.send(null);
        };

        /*
         ************ Event *************
         */

        /**
         * @private
         * @desc Recursively retrieve event data.
         * @param {function} next - End of chain callback function to display initial data.
         * @param {array} elist - List of events to load. Assuming not called if clist empty.
         * @returns {undefined}
         */
        function getAllEvents(next, elist) {
            var request = new XMLHttpRequest();
            request.onload = function () {
                var event;
                if (request.status === 200) {
                    event = JSON.parse(request.responseText);
                    event.found = false;  // Used to track when in range
                    //pePM.eventMap.push(event);
                    pePM.addEvent(event);
                    // recursively retreiving events (elist was popped)
                    getAllEvents(next, elist);
                }
                else if (request.status === 404) {
                    mhLog.log(mhLog.LEVEL.DEBUG, "Skipping Event...");
                    // recursively retreiving events (elist was popped)
                    getAllEvents(next, elist);
                }
                else {
                    handleRetrievalError("getAllEvents: Error retrieving user events.", true);
                }
            };
            // Need to make sure clist.pop() is not undefined.
            if (elist.length > 0) {
                request.open("GET", "/peAPI/event/" + elist.pop());
                request.send(null);
            } else {
                mhLog.log(mhLog.LEVEL.PRODUCTION, "pePS.getAllEvents: Events all done.");
                next();
            }
        }

        /*
         ************ Feed ************
         */

         /**
          * @public
          * @desc Creates a Feed object for the given user and story if one does not already exist. 
          * @param {object} feedData - The data that makes up a feed.
          * @returns {undefined}
          */
         pePlayerServer.submitNewFeed = function(feedData) {
            var request = new XMLHttpRequest();
            request.onload = function () {
                var feed;
                if (request.status === 200) {
                    feed = JSON.parse(request.responseText);
                    pePM.feedMap.push(feed);
                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Error submitting new feed");
                }
            };
            request.open("POST", "/peAPI/feed");
            request.setRequestHeader("Content-Type", "application/json");
            request.send(JSON.stringify(feedData));
        };

        /** 
         * getFriendsFeed
         * @desc Retrieve list of following friends from database.
         * @param {String} userId
         * @param {function} displayCallback
         * @returns {undefined}
         */
        pePlayerServer.getFriendsFeed = function(user, displayCallback) {
            var request = new XMLHttpRequest();
            request.onload = function() {
                var friends;
                if (request.status === 200) {
                    friends = JSON.parse(request.responseText);
                    if (friends) {
                        displayCallback(friends);
                    }
                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Error retrieving user following friends");
                }
            };
            // peAPI/feed/friends/:id
            request.open("GET", "/peAPI/feed/friends/" + user);
            request.send(null);
        };

        pePlayerServer.getNearbyFeeds = function (coords, displayCallback) {
            var request = new XMLHttpRequest();
            request.onload = function() {
                var feeds;
                if (request.status === 200) {
                    feeds = JSON.parse(request.responseText);
                    if (feeds) {
                        displayCallback(feeds);
                    }
                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Error retrieving nearby feeds");
                }
            };
            // peAPI/feed/nearby/:lng/:lat
            request.open("GET", "/peAPI/feed/nearby/" + coords[0]+"/"+coords[1]);
            request.send(null);
        };

        /*
         ************ Message *************
         */
        pePlayerServer.getUserFacebookFriends = function (friendIds, displayCallback) {

            var request = new XMLHttpRequest();

            request.onload = function() {
                var friends; 
                if(request.status === 200) {
                    friends = JSON.parse(request.responseText);
                    if (friends) {
                        displayCallback(friends);
                    }
                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Error retrieving friend names");

                }
            }
            request.open("GET", "/peAPI/user/facebook/friends/" + friendIds);
            request.send(null);
        };

        pePlayerServer.sendMessage = function (message, nextCall, param1, param2, displayCallback) {
            
            var request = new XMLHttpRequest();
            request.onload = function () {
                
                if (request.status === 200) {
                    mhLog.log(mhLog.LEVEL.DEBUG, "Message saved successfully");
                    nextCall(param1, param2, displayCallback);
                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Error submitting new feed");
                }
            };
            request.open("POST", "/peAPI/message");
            request.setRequestHeader("Content-Type", "application/json");
            request.send(JSON.stringify(message));
        };
        
        pePlayerServer.getMessages = function(userId, eventId, displayCallback) {

            var request = new XMLHttpRequest();

            request.onload = function() {
                var messages; 
                if(request.status === 200) {
                    messages = JSON.parse(request.responseText);
                    if (messages) {
                        displayCallback(messages);
                    }
                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Error retrieving messages");

                }
            }
            request.open("GET", "/peAPI/message/conversations/" + userId + "," + eventId);
            request.send(null);            
        };

        pePlayerServer.updateMessageAsSeen = function(messageId, displayCallback) {

            var request = new XMLHttpRequest();
            request.onload = function () {

                if (request.status === 200) {
                    mhLog.log(mhLog.LEVEL.DEBUG, "Message updated successfully");
                    if (displayCallback) {
                        displayCallback();
                    }
                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Error updating message as seen");
                }
            };
            request.open("PUT", "/peAPI/message/seen/" + messageId);
            request.setRequestHeader("Content-Type", "application/json");
            request.send(null);
        }

        /*
         ********** Notification **********
         */

        pePlayerServer.getNotifications = function(userId, displayCallback) {
            var request = new XMLHttpRequest();

            request.onload = function() {
                var messages;
                if (request.status === 200) {
                    messages = JSON.parse(request.responseText);
                    if (messages) {
                        displayCallback(messages);
                    }
                }
                else {
                    mhLog.log(mhLog.LEVEL.PRODUCTION, "Error retrieving messages");
                }
            }
            request.open("GET", "/peAPI/message/for/" + userId);
            request.send(null);
        }

        /*
         ************ Utility *************
         */


        /**
         * @private
         * @desc To help performance, fetch the first image of each story
         * @param {Story} s
         * @returns {undefined}
         */
        function prefetchStoryOverviewImage(s) {
            var pimg = new Image();
            if (s && s.image) {
                pimg.src = s.image;
            }
        }

        function handleRetrievalError( msg, spinner ) {
            mhLog.log(mhLog.LEVEL.PRODUCTION, msg );
            if( spinner ){
                stopSpinner();
            }
        }

        /**
         * @private
         * @desc Stops the page loading widget.  This same function appears in
         * pePlayerController because did not want to create a circular reference between this module
         * and that one.  Just be aware that if you change this function you will need to change it
         * in pePlayerController as well.
         * @returns {undefined}
         */
        function stopSpinner() {
            mhLog.log(mhLog.LEVEL.DEVELOPMENT, "STOP SPINNER");
            $.mobile.loading('hide');
        }

        // Export to other modules
        return pePlayerServer;

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

