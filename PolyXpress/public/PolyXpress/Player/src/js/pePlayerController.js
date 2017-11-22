/**
 * @module pePlayerController
 * @name pePlayerController
 * @exports pePlayerController
 * @requires pePlayerModel
 * @requires pePlayerMapController
 * @requires pePlayerServer
 * @requires mhLog
 * @version 0.1 [June 1, 2014]
 * @author Michael Haungs
 * @copyright Copyright 2012 Michael Haungs [mhaungs at calpoly.edu]
 * @license MIT
 * @desc Initializes mobile player application, coordinates changes
 * in the Model (pePM.js (local), pePS(remote)) and the view (pePlayer.html).
 * This module should only be used as a singleton.
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
    var pePlayerController;
    pePlayerController = {};
    pePlayerController.test = {};

    /*
     * Assigning exports like this allows dependency injection
     * (aka var sample = require("./sample.js")(app);)
     */
    container.exports = function (config) {

        /*
         * Configuration
         */
        "use strict";  // EMCAScript 5 pragma to catch more javascript error
        var mhLog = config.mhLog;

        /*
         * Imports
         */
        var pePM = require("src/js/pePlayerModel")(pePlayerController, config);
        var pePS = require("src/js/pePlayerServer")(pePM, config);
        var pePMapC = require("src/js/pePlayerMapController")(pePlayerController, pePM, config);
        var peSocial = require("src/js/pePlayerSocial")(pePlayerController, pePS, pePM, config);

        /**
         * @desc Data of logged in user.  Data defined by models/polyXpressUserModels.
         * @private
         */
        var authorData;
        /**
         * @desc ID of current story.  It is the unique database Id.
         * @private
         */
        var storyID;
        /**
         * @desc ID of current chapter.  It is the unique database Id.
         * @private
         */
        var chapterID;
        /**
         * @desc ID of current event.  It is the unique database Id.
         * @private
         */
        var eventID;

        // Other private variables used to temporarily keep track of UI state
        var displayChapterFoundPopup = false;
        var displayEventFoundPopup = false;

        /*
         ************ JQM Event methods *************
         */

        // account page
        $(document).on("pagebeforeshow", "#account", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow: account");
            pePlayerController.viewAccountData();
        });

        // libraryView page
        $(document).on("pagebeforeshow", "#libraryView", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow: libraryView");
            pePlayerController.showLibraryView();
        });

        $(document).on("pagecreate", "#libraryView", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate: libraryView");
            document.getElementById("sbtn").onclick = pePlayerController.showLibraryView;  // Refresh Library View
            document.getElementById("keywordSearch").onkeypress = pePlayerController.keywordSearch;
        });

        // notificationView page
        $(document).on("pagebeforeshow", "#notificationView", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow: notificationView");
            peSocial.showNotificationView();
        });

        // mainView page
        $(document).on("pagebeforeshow", "#mainView", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow: mainView");
            pePlayerController.showMainView();
        });

        $(document).on("pagecreate", "#mainView", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate: mainView");
        });

        // feedView page
        $(document).on("pagebeforeshow", "#friendsView", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow: friendsView");
            pePlayerController.showFriendsView();
        });

        // nearbyView page
        $(document).on("pagebeforeshow", "#publicView", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow: publicView");
            pePlayerController.showPublicView();
        });

        // chapter Map View
        $(document).on("pagecreate", "#mapViewChapters", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate: mapViewChapters");
            document.getElementById("chaptersYourLocationButton").onclick = pePMapC.mapViewChaptersYourLocation;
            document.getElementById("chaptersChapterLocationButton").onclick = pePMapC.mapViewChaptersChapterLocation;
            document.getElementById("sendCommentButton").onclick = peSocial.publishChapterComment;
            document.getElementById("showCommentsSwitch").change = peSocial.changeCommentDisplay;
        });

        // event Map View
        $(document).on("pagecreate", "#mapViewEvents", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate: mapViewEvents");
            document.getElementById("eventsYourLocationButton").onclick = pePMapC.mapViewEventsYourLocation;
            document.getElementById("eventsEventLocationButton").onclick = pePMapC.mapViewEventsEventLocation;
            document.getElementById("accuracyLabel").className = "accuracyLabelGreen";
        });

        // event scrapbook page
        $(document).on("pagebeforeshow", "#scrapbookView", function() {
            mhLog.log(mhLog.LEVEL.DEBUG, "pagebeforeshow: scrapbookView");

            document.getElementById("newMessageButton").onclick = peSocial.showChooseFriendsPopup;
            document.getElementById("cancelSendMessageButton").onclick = peSocial.hideNewMessageArea;
            document.getElementById("sendMessageButton").onclick = peSocial.sendMessageFromButton;
            pePS.getMessages(authorData._id, pePlayerController.getCurrentEventID(), peSocial.refreshConversations);
        });

        // event for capturing choose friend popup closing
        $(document).on("click", "#chooseFriendPopup-screen", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "popup screen closing: chooseFriendPopup");
            $("#newMessageButton").toggleClass("hide");
        });


        /*
         ************ Initialization *************
         */

        /**
         * @public
         * @desc Centralizes connecting document elements to event handlers.
         * @returns {undefined}
         */
        pePlayerController.checkIfAuthenticated = function () {
            // If previously logged in (Check via server code), show main menu
            pePS.checkAuth(function (authInfo) {
                if (authInfo.loggedIn) {
                    mhLog.log(mhLog.LEVEL.DEBUG, "checkAuth (anonymous callback): " + authInfo.loggedIn);
                    pePlayerController.showMainView();
                }
            });
        };

        /*
         ************ instructionView *************
         */

        /*
         ************ account  *************
         */

        /**
         * @public
         * @desc (deprecated) Display the user account data.
         * @returns {undefined}
         */
        pePlayerController.viewAccountData = function () {
            var accountName, accountID, linkFB, linkTW, linkG;

            accountName = document.getElementById("accountDisplay_fname");
            accountName.innerHTML = authorData.name;

            accountID = document.getElementById("accountDisplay_peid");
            accountID.innerHTML = authorData._id;

            if (authorData.facebook && authorData.facebook.id && authorData.facebook.token) {
                linkFB = document.getElementById("linkFBButton");
                linkFB.href = "/unlink/facebook";
                linkFB.innerHTML = "Unlink Facebook Account";
            } else {
                linkFB = document.getElementById("linkFBButton");
                linkFB.href = "/connect/facebook";
                linkFB.innerHTML = "Link Facebook Account";
            }

            if (authorData.twitter && authorData.twitter.id && authorData.twitter.token) {
                linkTW = document.getElementById("linkTWButton");
                linkTW.href = "/unlink/twitter";
                linkTW.innerHTML = "Unlink Twitter Account";
            } else {
                linkTW = document.getElementById("linkTWButton");
                linkTW.href = "/connect/twitter";
                linkTW.innerHTML = "Link Twitter Account";
            }

            if (authorData.google && authorData.google.id && authorData.google.token) {
                linkG = document.getElementById("linkGButton");
                linkG.href = "/unlink/google";
                linkG.innerHTML = "Unlink Google Account";
            } else {
                linkG = document.getElementById("linkGButton");
                linkG.href = "/connect/google";
                linkG.innerHTML = "Link Google Account";
            }
        };

        /**
         * @public
         * @desc When submitting data, pePS needs to use authorData.
         * @returns {user} authorData - The current author data as defined in models/polyXpressUserModels
         */
        pePlayerController.getAuthorData = function () {
            return authorData;
        };

        /**
         * @private
         * @desc Used as a callback in "showMainMenu". Display custom welcome message to user.
         * @param {user} adata
         * @returns {undefined}
         */
        function useAuthorData(adata) {
            authorData = adata;
            mhLog.log(mhLog.LEVEL.DEBUG, "In setAuthorData: " + JSON.stringify(authorData));

            $.mobile.changePage("#mainView");

            // @todo:  Changing to a new page will stop any spinners, going to start it again.
            // need to add a boolean that is set with startSpinner and unset with stopSpinner
            // and then restart spinner here if that boolean is set.

            startSpinner();

            $('#userName').html(authorData.name);
            $('#profilePicture').attr('src', 'https://graph.facebook.com/' + authorData.facebook.id + '/picture?width=75&height=75');
            /*var greeting = document.getElementById("userGreeting");
             greeting.innerHTML = "Welcome, " + authorData.name;*/
        }

        /*
         ************ mainView (main user view) *************
         */

        /**
         * @public
         * @desc This initializes the main menu view.
         * @returns {undefined}
         */
        pePlayerController.showMainView = function () {
            startSpinner();  // spinner is stopped at the end of populateStoryList or by pePlayerServer (if error occurs)

            // get author data and save it, if necessary, and display welcome message
            if (typeof authorData === 'undefined') {
                mhLog.log(mhLog.LEVEL.DEBUG, "showMainView:  author is undefined");
                // includes fetching author stories, chapters, and events!!!!
                pePS.getAuthorData(useAuthorData, populateStoryList);
            }
            else {
                mhLog.log(mhLog.LEVEL.DEBUG, "showMainMenu:  author is defined");
                useAuthorData(authorData);
                populateStoryList();
            }
        };

        pePlayerController.populateStoryList = function () {
            populateStoryList();
        }

        /**
         * @private
         * @desc Populates id=existingStoryList with stories owned/created by author.
         * @returns {undefined}
         */
        function populateStoryList() {
            var i, ulReading, ulCompleted, ulAuthored, li, a, h, p;

            // clear out story
            ulReading = document.getElementById("storyList");
            wipeChildrenList(ulReading);

            // clear out completed list
            ulCompleted = document.getElementById("completedList");
            wipeChildrenList(ulCompleted);

            // clear out authored story list
            ulAuthored = document.getElementById("authorStoryList");
            wipeChildrenList(ulAuthored);

            /* @todo  (Maybe) showStoryOverview is called everytime an "li" item is clicked.  Not
             * really a huge problem...just a little inefficient...either this or use a global variable
             */

            // Fill out story list
            for (i = 0; i < pePM.storyMap.length; i++) {
                createStoryListItem(pePM.storyMap[i], ulReading, ulCompleted, ulAuthored, authorData.readingList, authorData.storyCompletedList, authorData.authorList);
            }

            stopSpinner();  // Stops spinner started in showMainView()

            // For dynamically created html, need to refresh via jquery in order
            // to get jquery mobile look and feel.
            if ($('#storyList').hasClass('ui-listview')) {
                $("#storyList").listview("refresh");
            }

            if ($('#completedList').hasClass('ui-listview')) {
                $('#completedList').listview("refresh");
            }

            if ($('#authorStoryList').hasClass('ui-listview')) {
                $("#authorStoryList").listview("refresh");
            }

        }

        /**
         * @private
         * @desc create a story list item
         * @param {story} story - JSON story object
         * @param {ul DOM element} ulReading - List container for reading list
         * @param {ul DOM element} ulAuthored - List container for authored list
         * @param {Array} readingList - The array of stories the user is reading
         * @param {Array} authorList - The array of stories the user has authored
         * @returns {undefined}
         */
        function createStoryListItem(story, ulReading, ulCompleted, ulAuthored, readingList, completedList, authorList) {
            var li, a, a2, h, p, cleanStr;

            li = document.createElement("li");
            a = document.createElement("a");
            a.href = "#overviewStory";

            if (story.image) {
                var imgElem = document.createElement("img");
                imgElem.onload = stopSpinner; // When image loads, stop spinner
                imgElem.src = story.image;
                a.appendChild(imgElem);
            }

            h = document.createElement("h4");
            h.innerHTML = story.title;
            a.appendChild(h);
            p = document.createElement("p");
            cleanStr = story.overview;
            cleanStr = cleanStr.replace(/\s+/gm," "); // Removes excessive new lines and whitespace
            cleanStr = cleanStr.replace(/<.+?>/gm, "");  // Removes html tags
            cleanStr = cleanStr.substring(0,50);  // limits total amount of characters
            p.innerHTML = cleanStr;
            a.appendChild(p);

            li.appendChild(a);
            li.setAttribute('data-theme', 'c');

            if (readingList.indexOf(story._id) >= 0) {

                mhLog.log(mhLog.LEVEL.DEBUG, "Creating a reading list item for story: " + story.title);
                li.onclick = listHelper(story._id, pePlayerController.showStoryOverview);

                // add onclick handlers bound to _id...Need to break down into DOM operations to add custom onclick handler
                a2 = document.createElement("a");
                a2.href = '#editStory';
                a2.setAttribute('data-rel', 'popup');
                a2.setAttribute('data-position-to', 'window');
                a2.setAttribute('data-transition', 'pop');
                a2.onclick = listHelper(story._id, showEditStoryPopup);
                a2.innerHTML = 'Edit Story';
                li.appendChild(a2);
                ulReading.appendChild(li);

            }
            else if (completedList.indexOf(story._id) >= 0) {

                mhLog.log(mhLog.LEVEL.DEBUG, "Creating a completed list item for story: " + story.title);
                li.onclick = listHelper(story._id, pePlayerController.showStoryOverview);

                // add onclick handlers bound to _id...Need to break down into DOM operations to add custom onclick handler
                a2 = document.createElement("a");
                a2.href = '#editStory';
                a2.setAttribute('data-rel', 'popup');
                a2.setAttribute('data-position-to', 'window');
                a2.setAttribute('data-transition', 'pop');
                a2.onclick = listHelper(story._id, showEditStoryPopup);
                a2.innerHTML = 'Edit Story';
                li.appendChild(a2);
                ulCompleted.appendChild(li);
            }
            else if ((authorList.indexOf(story._id) >= 0)) {

                mhLog.log(mhLog.LEVEL.DEBUG, "Creating a autho list item for story: " + story.title);
                if (story.test) {
                    li.setAttribute('data-theme', 'b');
                }
                li.onclick = listHelper(story._id, pePlayerController.showStoryOverview);
                ulAuthored.appendChild(li);
            }
            else {
                mhLog.log(mhLog.LEVEL.DEBUG, "Story didn't fit into a list for story: " + story.title);
            }
        }

        /**
         * @private
         * @desc Display and populate story editing popup
         * @param {database id} id - Unique database id for a story
         * @returns {undefined}
         */
        function showEditStoryPopup(id) {
            /* jshint validthis:true */
            var removeBtn, markButton;
            mhLog.log(mhLog.LEVEL.DEBUG, "showEditStoryPopup: id = " + id);

            // Need to assign click handlers to mark and remove buttons
            // those button handlers with then update user's data accordingly
            removeBtn = document.getElementById("removeStoryButton");
            removeBtn.onclick = removeStoryFromReadingList.bind(this, id);

            // NOTE:  Commented out lines below because no longer need or want to
            // give the user the ability to manually mark a story complete.  This is
            // done automatically.
            markButton = document.getElementById("markStoryButton");
            markButton.onclick = moveStoryToCompletedList.bind(this, id);
        }

        /**
         * @private
         * @desc Removes the story from the user's reading list
         * @param id
         */
        function removeStoryFromReadingList(id) {
            mhLog.log(mhLog.LEVEL.DEBUG, "removeStoryFromReadingList: story id = " + id);
            // Remove item from author data
            authorData.readingList.splice(authorData.readingList.indexOf(id), 1);
            // Commenting this out because it was removing the story from the model map even 
            // though we still need the story around in cache because we might want to add
            // it back later. 
            //pePM.removeStory(id);
            pePS.updateAuthor(authorData);
            populateStoryList();
        }

        function moveStoryToCompletedList(storyId) {

            if ($.inArray(storyId, authorData.storyCompletedList) == -1) {
                mhLog.log(mhLog.LEVEL.DEBUG, "moving Story To Completed List: " + storyId);

                // Update feed item
                createOrUpdateFeed(authorData._id, authorData.facebook.id, storyId, "completed");
                
                // Move story from reading list to completed list
                authorData.readingList.splice(authorData.readingList.indexOf(storyId), 1);
                authorData.storyCompletedList.push(storyId);
                mhLog.log(mhLog.LEVEL.DEBUG, "readingList" + JSON.stringify(authorData.readingList) + "    completedList:" + JSON.stringify(authorData.storyCompletedList));
                pePS.updateAuthor(authorData);
                populateStoryList();
            }
            else {
                mhLog.log(mhLog.LEVEL.DEBUG, "Story already in Completed List: " + storyId);
            }

        }

        /*
         ************ libraryView (store view) *************
         */

        /**
         * @public
         * @desc This initializes the store view.
         * @returns {undefined}
         */
        pePlayerController.showLibraryView = function () {
            var ul;
            mhLog.log(mhLog.LEVEL.DEBUG, "showLibraryView:  libraryView initialization event fired");

            document.getElementById("keywordSearch").value = "";
            // clear out story list
            ul = document.getElementById("keywordStories");
            wipeChildrenList(ul);
            startSpinner();  // spinner is stopped at the end of "populateRecentStoryList"
            pePS.getRecentStories(populateRecentStoryList);
        };

        /**
         * @public
         * @desc Collect keyword and start search for stories.
         * @param {Event} event - Looking to see if user hit 'return'
         */
        pePlayerController.keywordSearch = function (event) {
            var keyword, result; // Remember, only one at a time
            if (event.keyCode === 13) {
                keyword = document.getElementById("keywordSearch").value;
                result = keyword.split(" ", 1)[0]; // ensures only have one keyword
                result.toLowerCase();
                if (result !== "") {
                    startSpinner();  // spinner stopped in "populateKeywordSearchList"
                    pePS.keywordSearch(result, populateKeywordSearchList);
                }
            }
        };

        /**
         * @private
         * @desc Populates id=recentStories with up to 15 most recent stories
         * @param {array} stories - array of stories to add to recent list
         * @returns {undefined}
         */
        function populateRecentStoryList(stories) {
            var i, ul, li;

            // clear out story list
            ul = document.getElementById("recentStories");
            wipeChildrenList(ul);

            // Fill out story list
            for (i = 0; i < stories.length; i++) {
                if (authorData.readingList.indexOf(stories[i]._id) >= 0 /*|| authorData.completedList.indexOf(stories[i]._id) >= 0*/) {
                    continue;
                }
                li = document.createElement("li");
                li.innerHTML = "<a href='#addLibraryStory' data-rel='popup' data-position-to='window' data-transition='pop'>" +
                               stories[i].title + "</a>";
                li.onclick = listHelper({id: stories[i]._id, li: li, ul: ul}, showAddStoryPopup);
                ul.appendChild(li);
            }

            stopSpinner(); // spinner started in "showLibraryView"

            // For dynamically created html, need to refresh via jquery in order
            // to get jquery mobile look and feel.
            if ($('#recentStories').hasClass('ui-listview')) {
                $("#recentStories").listview("refresh");
            }
        }

        /**
         * @private
         * @desc Set up the button on add story from recent list popup
         * @param data
         * @returns {undefined}
         */
        function showAddStoryPopup(data) {
            /* jshint validthis:true */
            var yesBtn;
            // Need to assign click handlers to yes button
            yesBtn = document.getElementById("addLibraryStoryButton");
            // @this bind used for currying only, this not used in function
            yesBtn.onclick = addRecentStory.bind(this, data);
        }

        /**
         * @private
         * @desc put the story into the user's story list
         * @param {story data} data - mainly need id field
         * @returns {undefined}
         */
        function addRecentStory(data) {
            var id = data.id;

            // Remove element from recent story or keyword search list
            data.ul.removeChild(data.li);

            // Need to make sure not already a story we are reading
            if (authorData.readingList.indexOf(id) >= 0) {
                mhLog.log(mhLog.LEVEL.DEVELOPMENT, "addRecentStory: Story(" + id + ") already in reading List");
                return;
            }
            authorData.readingList.push(id);
            pePS.updateAuthor(authorData);
            pePS.getStory(id, populateStoryList);
            pePlayerController.showLibraryView();
            //pePlayerController.keywordSearch({keyCode: 13});  // sending keycode to simulate return being pressed
        }

        /**
         * @private
         * @desc Add stories retrieved from keword search to keyword list.
         * @param {array] stories - Array of stories returned from server-side search of db
         * @returns {undefined}
         */
        function populateKeywordSearchList(stories) {
            var i, ul, li;

            // clear out story list
            ul = document.getElementById("keywordStories");
            wipeChildrenList(ul);

            // Fill out story list
            for (i = 0; i < stories.length; i++) {
                if (authorData.readingList.indexOf(stories[i]._id) >= 0 /*|| authorData.completedList.indexOf(stories[i]._id) >= 0*/) {
                    mhLog.log(mhLog.LEVEL.DEVELOPMENT, "populateKeywordSearchList:  Already in reading List");
                    continue;
                }

                li = document.createElement("li");
                li.innerHTML = "<a href='#addLibraryStory' data-rel='popup' data-position-to='window' data-transition='pop'>" +
                               stories[i].title + "</a>";
                li.onclick = listHelper({id: stories[i]._id, li: li, ul: ul}, showAddStoryPopup);
                ul.appendChild(li);
            }

            stopSpinner();  // spinner started in "keywordSearch"

            // For dynamically created html, need to refresh via jquery in order
            // to get jquery mobile look and feel.
            if ($('#keywordStories').hasClass('ui-listview')) {
                $("#keywordStories").listview("refresh");
            }
        }

        /**
         ************ friendsOverview ************
         **/

        /**
         * @public
         * @desc Initializes the friends view.
         * @returns {undefined}
         **/
        pePlayerController.showFriendsView = function() {
            mhLog.log(mhLog.LEVEL.DEBUG, "initializing friends view");
            startSpinner();
            pePS.getFriendsFeed(authorData.facebook.id, populateFriendsFeed);
        }

        /**
         * @public
         * @desc Initializes the nearby view.
         * @returns {undefined}
         **/
        pePlayerController.showPublicView = function() {
            mhLog.log(mhLog.LEVEL.DEBUG, "initializing public view");

            if (navigator.geolocation) {
                var options = {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                };
                mhLog.log(mhLog.LEVEL.DEBUG, "Geolocation supported");
                navigator.geolocation.getCurrentPosition(requestNearbyFeeds, displayLocationError, {});
            }
            else {
                mhLog.log(mhLog.LEVEL.DEBUG, "Geolocation not supported");
            }
        };

        function requestNearbyFeeds(position) {
            var coords = position.coords;
            mhLog.log(mhLog.LEVEL.DEBUG, "Your current position is:");
            mhLog.log(mhLog.LEVEL.DEBUG, "Latitude : " + coords.latitude);
            mhLog.log(mhLog.LEVEL.DEBUG, "Longitude: " + coords.longitude);
            mhLog.log(mhLog.LEVEL.DEBUG, "More or less " + coords.accuracy + " meters.");

            // Google geocoder to look up city name from coordinates. 
            var geocoder = new google.maps.Geocoder();

            var latLng = new google.maps.LatLng(coords.latitude, coords.longitude);
            pePS.getNearbyFeeds([coords.longitude, coords.latitude], populateNearbyFeed);
            // Look up the city name using story lat/lng coordinates.
            geocoder.geocode({'location': latLng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                     mhLog.log(mhLog.LEVEL.DEBUG, "City: " + results[0].address_components[3].short_name + ", " + 
                        results[0].address_components[5].short_name);
                    // TODO: Get feeds from server. Will need to calculate distance in meters, 30 closest stories 
                    // that are within 32000 meters (~10 miles);

                } 
                else {
                    // Use something fake on error.
                     mhLog.log(mhLog.LEVEL.DEBUG, "City: a galaxy far far away");
                }
            });
            //startSpinner();
            
        };

        function displayLocationError(err) {

        };

         /** 
          * @private
          * @desc List the Feeds of friends. 
          * @param {array} List of Feeds
          * @returns {undefined}
          */
        function populateFriendsFeed(feeds) {
            mhLog.log(mhLog.LEVEL.DEBUG, "Populating the friends feed");

            var list = $("#friendsFeed").listview();
            list.empty();
    
            for (var i = 0; i < feeds.length; i++) {
                var o = feeds[i];
                 
                var li = $('<li class="ui-li ui-li-static ui-btn-up-a ui-li-has-thumb">\n\
                                <img src="https://graph.facebook.com/' + o.facebookId + '/picture?width=75&height=75" class="ui-li-thumb">\n\
                                <h3 class="ui-li-heading">' + o.user.name + '</h3>\n\
                                <p class="ui-li-desc textwrap">' + o.action + ' a story called ' + o.story.title + ' in ' + o.city + '.</p></li>');
                li.on("click", listHelper(o.story._id, openAddStoryFromFeedPopup));
                list.append(li);
            }

            $("#friendsFeed").listview("refresh");
        }

        function populateNearbyFeed(feeds) {
            mhLog.log(mhLog.LEVEL.DEBUG, "Populating the nearby feed");

            var list = $("#publicFeed").listview();
            list.empty();
    
            for (var i = 0; i < feeds.length; i++) {
                var o = feeds[i];
                 
                var li = $('<li class="ui-li ui-li-static ui-btn-up-a ui-li-has-thumb">\n\
                                <img src="https://graph.facebook.com/' + o.facebookId + '/picture?width=75&height=75" class="ui-li-thumb">\n\
                                <h3 class="ui-li-heading">' + o.user.name + '</h3>\n\
                                <p class="ui-li-desc textwrap">' + o.action + ' a story called ' + o.story.title + ' in ' + o.city + '.</p></li>');
                li.on("click", listHelper(o.story._id, openAddStoryFromFeedPopup));
                list.append(li);
            }

            $("#publicFeed").listview("refresh");
        }

        /**
         * Opens the popup that asks the user if they want to add the story to their reading list. 
         * Adds "yes" button click functionality by binding the click with the given story id. 
         */
        function openAddStoryFromFeedPopup(storyId) {
            $("#addStoryFromFeedPopup").popup("open");
            $("#addStoryYesButton").on("click", listHelper(storyId, addStoryFromFeed));
        }

        /**
         * Adds the story to the reading list, if not already present. Code taken from addRecentStory().
         */
        function addStoryFromFeed(storyId) {
            // Need to make sure not already a story we are reading
            if (authorData.readingList.indexOf(storyId) >= 0) {
                mhLog.log(mhLog.LEVEL.DEVELOPMENT, "addStoryFromFeed: Story(" + storyId + ") already in reading List");
                return;
            }
            authorData.readingList.push(storyId);
            mhLog.log(mhLog.LEVEL.DEBUG, "Before updating authordata of server: " + JSON.stringify(authorData));
            pePS.updateAuthor(authorData);
            pePS.getStory(storyId, populateStoryList);
        }

        /*
         ************ overviewStory *************
         */

        /**
         * @public
         * @desc Populate the #overviewStory page with information from the current story.
         * @param {database id} id
         * @returns {undefined}
         */
        pePlayerController.showStoryOverview = function (id) {
            var story, imgElem, tElem, divElem, pElem, bElem, errorElem;

            mhLog.log(mhLog.LEVEL.DEBUG, "showStoryOverview:  Story id =  " + id);

            pePlayerController.setCurrentStoryID(id);   // Save the refedrence to the chapter

            story = pePM.findStoryByID(id);

            if (story) {

                startSpinner();

                // @todo:  load all of the chapters and events for this story now instead of
                // when users first vists the app.  This will make startup much faster and scales
                // to many stories.

                // Need to make what is below a callback function that will be called after everything
                // is downloaded.

                tElem = document.getElementById("overviewStoryTitle");
                tElem.innerHTML = story.title;

                if (story.image) {
                    divElem = document.getElementById("overviewStoryImage");
                    wipeChildrenList(divElem);
                    imgElem = document.createElement("img");

                    imgElem.onload = stopSpinner; // When image loads, stop spinner
                    imgElem.src = story.image;
                    divElem.appendChild(imgElem);
                    //divElem.innerHTML = "<img onload='stopSpinner();' src=\"" + story.image + "\"/>";
                } else {
                    stopSpinner();
                }

                pElem = document.getElementById("overviewStoryText");
                pElem.innerHTML = story.overview;

                bElem = document.getElementById("overviewStoryBtn");
                bElem.onclick = pePlayerController.showChapter.bind(window, id);

                // Create Feed item in database if one does not exist
                createOrUpdateFeed(authorData._id, authorData.facebook.id, story._id, "started")

            } else {
                // Story does not exist
                pePlayerController.setCurrentStoryID(null);   // Saved previously invalid ID, need to clear
                errorElem = document.getElementById("errorPage");
                errorElem.innerHTML = "Invalid Story, please delete story from your reading list";
                // navigate to error page
                $.mobile.changePage($("#notFunctional"));
            }

        };

        /**
         * @public
         * @desc Record the story the user is currently viewing
         * @param id
         */
        pePlayerController.setCurrentStoryID = function (id) {
            storyID = id;
        };

        /**
         * @public
         * @desc Return the story the user is currently viewing
         * @returns {*}
         */
        pePlayerController.getCurrentStoryID = function () {
            return storyID;
        };

        /*
         ************ mapViewChapters *************
         */

        /**
         * @public
         * @desc Display the chapter data on the #mapViewChapters page
         * @param id
         * @returns {undefined}
         */
        pePlayerController.showChapter = function (id) {
            var story = pePM.findStoryByID(id);
            var ul, vul, li;

            // set title
            var tElem = document.getElementById("chapterViewTitle");
            tElem.innerHTML = story.title;

            // setup onclick link to map
            /*var aElem = document.getElementById("mapViewChaptersBtn");
             aElem.onclick = pePMapC.showChapterMap.bind(window, id);*/

            // clear out story list
            ul = document.getElementById("chapterList");
            wipeChildrenList(ul);
            vul = document.getElementById("viewedChapterList");
            wipeChildrenList(vul);

            mhLog.log(mhLog.LEVEL.DEBUG, "Story chapterList length: " + story.chapterList.length);
            if (story.chapterList && (story.chapterList.length !== 0)) {
                // Add all story chapters to list
                story.chapterList.map(listChapter.bind(window, ul, vul));

                // refresh list
                if ($('#chapterList').hasClass('ui-listview')) {
                    $("#chapterList").listview({icon: "arrow-r"});
                    $("#chapterList").listview("refresh");
                }

                if ($('#viewedChapterList').hasClass('ui-listview')) {
                    $("#viewedChapterList").listview("refresh");
                }

            }
            // if user has viewed all the chapters...
            if (ul.firstChild === null) {
                mhLog.log(mhLog.LEVEL.DEBUG, "All done with chapters!");
                li = document.createElement("li");
                li.innerHTML = "<a href='#mainView'><h1>Story Complete!</h1><p>Click me to go back<br>to the Main Menu</p></a>";
                ul.appendChild(li);  // ul is bound
                if ($('#chapterList').hasClass('ui-listview')) {
                    $("#chapterList").listview({icon: "home"});
                    $("#chapterList").listview("refresh");
                }
                moveStoryToCompletedList(id);
            }
        }; 

        /**
         * @public
         * @desc Every time the users moves their icon on the map is updated and this
         * function is called.  This function will display a "Chapter Found" popup if
         * user moves into range.
         * @param {LatLng} cloc - Google latitude/longitude object
         */
        pePlayerController.updateChapterLocation = function (cloc) {

            // refresh event list in case events are not in or out of range
            pePlayerController.showChapter(pePlayerController.getCurrentStoryID());

            if (displayChapterFoundPopup) {
                $("#newChapterNotification").popup("open", {positionTo: "window", transition: "pop"});
                displayChapterFoundPopup = false;
            }

        };

        /**
         * @public
         * @desc Allows chapter markers to open the chapter panel when clicked.  Actual
         * assignment to in pePlayerModel.
         * @returns {Function}
         */
        pePlayerController.getChapterOpenPanelFunction = function () {
            return function () {
                $("#chaptersPanel").panel("open");
            };
        };

        /**
         * @public
         * @desc Allows event markers to open the event panel when clicked.  Actual
         * assignment to in pePlayerModel.
         * @returns {Function}
         */
        pePlayerController.getEventOpenPanelFunction = function () {
            return function () {
                $("#pagesPanel").panel("open");
            };
        };

        /**
         * @private
         * @desc List chapters (found or not) in the chapter Panel
         * @returns {undefined}
         */
        function listChapter(ul, vul, id) {
            var li;
            var chapter = pePM.findChapterByID(id);

            if (chapter) {

                // Chapter not completed
                if (chapter.completed !== true || !allChapterEventsSeen(chapter)) {
                    // Chapter in range.
                    if (pePMapC.chapterInRange(chapter)) {
                        if (chapter.found === false) {
                            displayChapterFoundPopup = true;
                        }
                        chapter.found = true;  // used for "Found Chapter" notification
                        li = document.createElement("li");
                        li.innerHTML = "<a href='#overviewChapter'>" + chapter.title + "</a>";
                        li.onclick = listHelper(chapter._id, pePlayerController.showChapterOverview);
                        ul.appendChild(li);  // ul is bound

                        // Optimization:  Prefetch chapter and Event resources
                        // @todo PROBLEM..this could potentially be called multiple times!
                        // possible solution...use another variable to keep track if called
                        prefetchChapterResources(chapter);
                    } 
                    // Chapter not in range.
                    else {
                        chapter.found = false;  // used for "Found Chapter" notification
                        li = document.createElement("li");
                        li.innerHTML = "<a href=''>" + chapter.title + "<br><span class='distance'>(" +
                                       pePMapC.getDistanceFromChapter(chapter) + " km)</span> </a>";
                        li.setAttribute("class", "inactive");
                        ul.appendChild(li);  // ul is bound
                    }
                } 
                // Chapter completed
                else {
                    li = document.createElement("li");
                    li.innerHTML = "<a href='#overviewChapter'>" +
                                   chapter.title + "</a>";
                    li.onclick = listHelper(chapter._id, pePlayerController.showChapterOverview);
                    vul.appendChild(li);  // ul is bound

                    // Optimization
                    // @todo Problem..this could be called multiple times too
                    prefetchChapterResources(chapter);
                }
            }

        }

        /**
         * @private
         * prefetch resources for given chapter.
         * @param {Chapter} c
         */
        function prefetchChapterResources(c) {
            var pimg;
            if (c.image) {
                pimg = new Image();
                pimg.src = c.image;
            }
        }

        /*
         ************ overviewChapter *************
         */

        /**
         * @public
         * @desc Populate #overviewChapter page with current chapter data.
         * @param id
         * @returns {undefined}
         */
        pePlayerController.showChapterOverview = function (id) {
            pePlayerController.setCurrentChapterID(id);

            var chapter = pePM.findChapterByID(id);

            // Chapter is comply completed if all events are seen.
            if (!chapter.completed || allChapterEventsSeen(chapter)) {  // handles false, null, and undefined
                chapter.completed = true;
                // @todo  Now, can send information to server that this is
                // completed and can store in user session.  The session will
                // exist predetermined amount of time and then expire.  When it
                // expires, then the user will have to visit location again.
                pePS.markChapterCompleted(chapter);
                authorData.chapterCompletedList.push(chapter._id);
                pePS.updateAuthor(authorData);
                mhLog.log(mhLog.LEVEL.DEBUG, "showChapterOverview: Chapter " + JSON.stringify(chapter) + " is done.");
            }

            var tElem = document.getElementById("overviewChapterTitle");
            tElem.innerHTML = chapter.title;

            var divElem = document.getElementById("overviewChapterImage");
            divElem.innerHTML = "<img src=\"" + chapter.image + "\"/>";

            var pElem = document.getElementById("overviewChapterText");
            pElem.innerHTML = chapter.overview;

            // Get the story comments from server and display
            pePS.getChapterComments(id, peSocial.populateChapterComments);

            /*var bElem = document.getElementById("overviewChapterBtn");
             bElem.onclick = pePlayerController.showEvent.bind(window, id);*/
        };

        function allChapterEventsSeen(chapter) {
            
            // Check that each event has been viewed by the user.
            for (var i = 0; i < chapter.eventList.length; i++) {
                
                if ($.inArray(chapter.eventList[i], authorData.eventCompletedList) == -1) {
                    return false;
                }

            }
            return true;
        }

        /**
         * @public
         * @desc Record the chapter the user is currently viewing
         * @param {database id} id
         * @returns {undefined}
         */
        pePlayerController.setCurrentChapterID = function (id) {
            chapterID = id;
        };

        /**
         * @public
         * @desc Return the chapter the user is currently viewing
         * @returns {database id} - The unique identifier for the current chapter
         */
        pePlayerController.getCurrentChapterID = function () {
            return chapterID;
        };

        /*
         ************ mapViewEvents *************
         */

        /**
         * @public
         * @desc Populates the #mapViewEvents page with event data from this chapter
         * @param {database id} id
         */
        pePlayerController.showEvent = function (id) {
            var chapter = pePM.findChapterByID(id);
            var ul, vul, li;

            // set title
            var tElem = document.getElementById("eventViewTitle");
            tElem.innerHTML = chapter.title;

            // setup onclick link to map
            /*var aElem = document.getElementById("mapViewEventsBtn");
             aElem.onclick = pePMapC.showEventMap.bind(window, id);*/

            // clear out event lists
            ul = document.getElementById("eventList");
            wipeChildrenList(ul);
            vul = document.getElementById("viewedEventList");
            wipeChildrenList(vul);

            if (chapter.eventList && (chapter.eventList.length !== 0)) {
                // Add all chapter events to list
                // @todo  Do I really need to bind to "window"?
                chapter.eventList.map(listEvent.bind(window, ul, vul));

                // refresh list
                if ($('#eventList').hasClass('ui-listview')) {
                    $("#eventList").listview({icon: "arrow-r"});
                    $("#eventList").listview("refresh");
                }

                if ($('#viewedEventList').hasClass('ui-listview')) {
                    $("#viewedEventList").listview("refresh");
                }
            }

            // if user has viewed all the pages...
            if (ul.firstChild === null) {
                mhLog.log(mhLog.LEVEL.DEBUG, "showEvent:  All pages complete.");
                li = document.createElement("li");
                li.innerHTML = "<a href='#mapViewChapters'><h1>Chapter Complete!</h1><p>Click me to go back<br>to the Chapter Menu</p></a>";
                //li.onclick = listHelper(event._id, pePlayerController.showScrapbookView);
                ul.appendChild(li);  // ul is bound
                if ($('#eventList').hasClass('ui-listview')) {
                    $("#eventList").listview({icon: "home"});
                    $("#eventList").listview("refresh");
                }

                // Mark chapter as complete if need be.
                if ($.inArray(chapter._id, authorData.chapterCompletedList) == -1) {
                    chapter.completed = true;
                    pePS.markChapterCompleted(chapter);
                    authorData.chapterCompletedList.push(chapter._id);
                    pePS.updateAuthor(authorData);
                    mhLog.log(mhLog.LEVEL.DEBUG, "Marking chapter as complete since all events have been viewed: " + chapter._id);
                }
            }

        };

        /**
         * @public
         * @desc Every time the users moves their icon on the map is updated and this
         * function is called.  This function will display a "Page Found" popup if
         * user moves into range.
         * @param {LatLng} cloc - Google latitude/longitude object
         */
        pePlayerController.updateEventLocation = function (cloc) {

            // refresh event list in case events are not in or out of range
            pePlayerController.showEvent(pePlayerController.getCurrentChapterID());

            if (displayEventFoundPopup) {
                $("#newEventNotification").popup("open", {positionTo: "window", transition: "pop"});
                displayEventFoundPopup = false;
            }
        };

        /**
         * @public
         * @desc Change the color of the GPS Indicator based on the current accuracy of the
         * GPS readings.
         * @param {number} accuracy - Current GPS accuracy in meters
         */
        pePlayerController.updateGPSIndicator = function (accuracy) {
            var gI = document.getElementById("accuracyLabel");

            if (accuracy < 50) {
                gI.className = "accuracyLabelGreen";
            } else if (accuracy < 200) {
                gI.className = "accuracyLabelYellow";
            } else {  // this is bascially, 200-300
                gI.className = "accuracyLabelRed";
            }
        };

        /**
         * @private
         * @desc List the events in this chapter in the Event Panel
         * @param {DOM elmement} ul
         * @param {DOM element} vul
         * @param {DOM element} id
         * @returns {undefined}
         */
        function listEvent(ul, vul, id) {
            var li;
            var event = pePM.findEventByID(id);

            if (event) {
                // Event not completed
                if ($.inArray(event._id, authorData.eventCompletedList) == -1) {
                    // Event in range
                    if (pePMapC.eventInRange(event)) {
                        if (event.found === false) {
                            displayEventFoundPopup = true;
                        }
                        event.found = true;  // Used to track newly found events
                        li = document.createElement("li");
                        li.innerHTML = "<a href='#scrapbookView'>" +
                                       event.title + "</a>";
                        li.onclick = listHelper(event._id, pePlayerController.showScrapbookViewSetup);
                        ul.appendChild(li);  // ul is bound

                        // Optimization
                        prefetchEventResources(event);
                    }
                    // Event not in range
                    else {
                        event.found = false; // Used to track newly found events
                        li = document.createElement("li");
                        li.innerHTML = "<a href=''>" + event.title + "<br>(" +
                                       pePMapC.getDistanceFromEvent(event) + " km) </a>";
                        li.setAttribute("class", "inactive");
                        ul.appendChild(li);  // ul is bound

                    }
                } 
                // Event completed 
                else {
                    li = document.createElement("li");
                    li.innerHTML = "<a href='#scrapbookView'>" +
                                   event.title + "</a>";
                    li.onclick = listHelper(event._id, pePlayerController.showScrapbookViewSetup);
                    vul.appendChild(li);  // ul is bound

                    // Optimization
                    prefetchEventResources(event);
                }
            }

        }

        /**
         * @private
         * @desc prefetch resources for given event.
         * @param {Chapter} e
         * @returns {undefined}
         */
        function prefetchEventResources(e) {
            var imgList = [], pimg, i = 0;
            if (e.assetList) {
                for (i = 0; i < e.assetList.length; i++) {
                    if (e.assetList[i].format === "image") {
                        pimg = new Image();
                        pimg.src = e.assetList[i].uri;
                        mhLog.log(mhLog.LEVEL.DEBUG, "prefetchEventResources: " + pimg.src);
                        imgList.push(pimg);
                    }
                }
            }
        }

        /*
         ************ scrapbookView (actual page) *************
         */

        pePlayerController.showScrapbookViewSetup = function (id) {

            peSocial.activateBackToMapButton();
            pePlayerController.showScrapbookView(id);
        }

        /**
         * @public
         * @desc Populate a "page" of the story with author assets.
         * @param id
         * @returns {undefined}
         */
        pePlayerController.showScrapbookView = function (id) {
            pePlayerController.setCurrentEventID(id);

            var event = pePM.findEventByID(id);

            if ($.inArray(id, authorData.eventCompletedList) == -1) {  // handles undefined, null, and false
                // We are viewing it for the first time!
                event.completed = true;
                pePS.markEventCompleted(event);
                authorData.eventCompletedList.push(event._id);
                pePS.updateAuthor(authorData);
                mhLog.log(mhLog.LEVEL.DEBUG, "showScrapbookView: Event " + JSON.stringify(event) + " done.");
            }

            var tElem = document.getElementById("scrapbookViewTitle");
            tElem.innerHTML = event.title;

            var divElem = document.getElementById("scrapbookViewAssets");
            wipeChildrenList(divElem);
            event.assetList.sort(function (a, b) {
                return a.order - b.order;
            });
            event.assetList.map(listAsset.bind(window, divElem));
        };

        /**
         * @public
         * @desc Record the event the user is currently viewing
         * @param id
         */
        pePlayerController.setCurrentEventID = function (id) {
            eventID = id;
        };

        /**
         * @public
         * @desc Return the event the user is currently viewing
         * @returns {database id}
         */
        pePlayerController.getCurrentEventID = function () {
            return eventID;
        };

        /**
         * @private
         * @desc Add asset to "page" page.
         * @param {DOM element} divElem
         * @param {asset data} asset
         * @returns {undefined}
         */
        function listAsset(divElem, asset) {
            var item;

            if (asset) {
                item = document.createElement("div");
                item.className = "assetview";
                item.appendChild(createAssetDisplayItem(asset.format, asset.uri));
                divElem.appendChild(item);  // divElem is bound
            }

        }

        /**
         * @private
         * @desc For the given asset, create a container for it and put it in the container.
         * @param {asset type} type
         * @param {string} uri
         * @returns {HTMLElement}
         * @todo if element has an invalid type then this method fails.  I have observed this happening
         * for Michael's Test Event 1.  Need to be more robust here and find out how the type for that
         * asset became invalid.
         */
        function createAssetDisplayItem(type, uri) {
            var elem;
            var elemInner;

            elem = document.createElement("div");
            elem.setAttribute("class", "highlight");

            if (type === "text") {
                elemInner = document.createElement("p");
                elemInner.innerHTML = uri;
            }
            else if (type === "imageURL") {
                // No extra style needed...already have it on all img tags
                elemInner = document.createElement("img");
                elemInner.src = uri;
            }
            else if (type === "imageEmbed") {
                elemInner = document.createElement("div");
                elemInner.setAttribute("class", "contained");
                elemInner.innerHTML = uri;
            }
            else if (type === "video") {
                elemInner = document.createElement("div");
                elemInner.setAttribute("class", "contained");
                elemInner.innerHTML = uri;
            }
            else if (type === "audio") {
                elemInner = document.createElement("div");
                elemInner.setAttribute("class", "contained");
                elemInner.innerHTML = uri;
            }

            elem.appendChild(elemInner);

            return elem;
        }

        /*
         ************ Feed Functions **************
        */
        function createOrUpdateFeed(userObjId, fbId, storyObjId, action) {
            
            mhLog.log(mhLog.LEVEL.DEBUG, action + "ing a feed");
            var feed = {};
            feed.story = storyObjId;
            feed.user = userObjId;
            feed.action = action;
            feed.facebookId = fbId;

            // Google geocoder to look up city name from coordinates. 
            var geocoder = new google.maps.Geocoder();

            // Retreive story to use its location
            var story = pePM.findStoryByID(storyObjId);

            // Using story's location. 
            var latLng = new google.maps.LatLng(story.proximity.lat, story.proximity.lng);
            feed.location = [story.proximity.lng, story.proximity.lat];
            
            // Look up the city name using story lat/lng coordinates.
            geocoder.geocode({'location': latLng}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    feed.city = results[0].address_components[3].short_name + ", " + 
                        results[0].address_components[5].short_name;
                    // save the Feed to database
                    pePS.submitNewFeed(feed);
                } 
                else {
                    // Use something fake on error.
                    feed.city = "a galaxy far far away";
                    pePS.submitNewFeed(feed);
                }
            });
        }

        /*
         ************ errorView *************
         */

        /*
         ************ General Display Utility functions *************
         */

        pePlayerController.startSpinner = function() {
            startSpinner();
        }

        pePlayerController.stopSpinner = function() {
            stopSpinner();
        }

        /**
         * @private
         * @desc Starts the page loading widget. Ref: http://api.jquerymobile.com/page-loading/
         * @returns {undefined}
         */
        function startSpinner() {
            mhLog.log(mhLog.LEVEL.ALL, "START SPINNER");
            //$.mobile.loading('show');  // I think this just does the defaults, so should be same as below
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
         * @desc Stops the page loading widget.  @todo This same function appears in
         * pePlayerServer because did not want to create a circular reference between this module
         * and that one.  Just be aware that if you change this function you will need to change it
         * in pePlayerServer as well.
         * @returns {undefined}
         */
        function stopSpinner() {
            mhLog.log(mhLog.LEVEL.ALL, "STOP SPINNER");
            $.mobile.loading('hide');
        }

        /**
         * @private
         * @desc Small utility function needed to capture a closure correctly.
         * @param {type} id
         * @returns {Function}
         */
        function listHelper(id, updateFunction) {
            var savedID = id;
            return function () {
                updateFunction(savedID);
            };
        }

        /**
         * @private
         * @desc clear a HTML list
         * @param {HTMLElement} ul
         * @returns {undefined}
         */
        function wipeChildrenList(ul) {
            // clear out list
            if (ul) {
                while (ul.firstChild) {
                    ul.removeChild(ul.firstChild);
                }
            }
        }

        // Export to other modules
        return pePlayerController;
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
