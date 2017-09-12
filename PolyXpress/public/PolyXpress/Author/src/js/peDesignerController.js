/**
 * @module peDC
 *
 * @requires peDS
 * @requires peDM
 * @requires mhLog
 *
 * @description Initializes mobile designer application, coordinates changes
 * in the Model (peDM.js (local), peDS(remote)) and
 * the view (peDesignerMain.html)
 *
 * @summary Controller for peDesigner.
 *
 * @copyright Michael Haungs, 2012
 * @license MIT
 *
 * @author Michael Haungs
 */

    // Begin Module Header
(function (container) {
    // End Module Header

    /** @alias module:peDC */
    var peDC = {}; // Exported Container (here to ensure one unique container is created and shared)
    peDC.test = {};

    // Assigning exports like this allows dependency injection (aka var sample = require("./sample.js")(app);)
    container.exports = function (testpeDS, testpeDM, config) {

        /*
         * Configuration
         */
        "use strict"; // EMCAScript 5 pragma to catch more javascript error
        var mhLog = config.mhLog;

        /*
         * Imports
         */
        var peDS = testpeDS ? testpeDS : require("./peDesignerServer")(false, config);
        var peDM = testpeDM ? testpeDM : require("./peDesignerModel")(config);

        // private variables
        var authorData; // Data of logged in user
        var updateStoryID = 0; // Temporary holder of a story ID
        var updateChapterID = 0; // Temporary holder of a chapter ID
        var updateEventID = 0; // Temporary holder of an event ID

        /*
         ************ JQM Event methods *************
         */

        // login page
        $(document).on("pagebeforeshow", "#login", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow:  login");
            // Good time to bind
        });

        $(document).on("pagebeforecreate", "#login", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforecreate:  login");
            // Good time to augment
        });

        $(document).on("pagecreate", "#login", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate:  login");
            // Page loaded into DOM
        });

        // mainMenu page
        $(document).on("pagebeforeshow", "#mainMenu", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow:  mainMenu");
            // Good time to bind
            peDS.getAuthorData.bind(this, useAuthorData); // Syncs with server data
        });

        $(document).on("pagebeforecreate", "#mainMenu", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforecreate:  mainMenu");
            // Good time to augment
        });

        $(document).on("pagecreate", "#mainMenu", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate:  mainMenu");
            // Page loaded into DOM
        });

        // storyManager page
        $(document).on("pagebeforeshow", "#storyManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow:  storyManager");
            // Good time to bind
            peDC.initStoryManager();
            clearStoryData();
        });

        $(document).on("pagebeforehide", "#storyManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforehide:  storyManager");
            // Good time to bind
        });

        $(document).on("pagebeforecreate", "#storyManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforecreate:  storyManager");
            // Good time to augment
        });

        $(document).on("pagecreate", "#storyManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate:  storyManager");
            // Page loaded into DOM

            // One time initialization of jQuery text editor...needs to be done prior to any of the
            // page events used for the storyData page.  Since storyManager will always occur before
            // showing the storyData page, this is an acceptable location.
            $(".rteOverview").jqte();
            document.getElementById("storyDataButton").onclick = peDC.createStory;
        });

        // chapterManager page
        $(document).on("pagebeforeshow", "#chapterManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow:  chapterManager");
            // Good time to bind
            peDC.initChapterManager();
            clearChapterData();
        });

        $(document).on("pagebeforehide", "#chapterManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforehide:  chapterManager");
            // Good time to bind
        });

        $(document).on("pagebeforecreate", "#chapterManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforecreate:  chapterManager");
            // Good time to augment
        });

        $(document).on("pagecreate", "#chapterManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate:  chapterManager");
            // Page loaded into DOM
            $(".rteCoverview").jqte();
            document.getElementById("chapterDataButton").onclick = peDC.createChapter;
        });

        // eventManager page
        $(document).on("pagebeforeshow", "#eventManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow:  eventManager");
            // Good time to bind
            peDC.initEventManager();
            clearEventData();
        });

        $(document).on("pagebeforehide", "#eventManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforehide:  eventManager");
            // Good time to bind
        });

        $(document).on("pagebeforecreate", "#eventManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforecreate:  eventManager");
            // Good time to augment
        });

        $(document).on("pagecreate", "#eventManager", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate:  eventManager");
            // Page loaded into DOM
            $(".rteAssetData").jqte();
            document.getElementById("eventDataButton").onclick = peDC.createEvent;
        });

        // storyData page
        $(document).on("pagebeforeshow", "#storyData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow:  storyData");
            // Good time to bind
        });

        $(document).on("pagebeforehide", "#storyData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforehide:  storyData");
            // Good time to bind
        });

        $(document).on("pagebeforecreate", "#storyData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforecreate:  storyData");
            // Good time to augment
        });

        $(document).on("pagecreate", "#storyData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate:  storyData");
            // Page loaded into DOM
            document.getElementById("storyAuthorManagement").onclick =
            peDC.initAuthorManagement.bind(this, createStory, removeAuthorFromStory);
            document.getElementById("submitStoryButton").onclick = peDC.submitStoryData;
            document.getElementById("deleteStoryBtn").onclick = peDC.deleteStoryData;
            document.getElementById("openMapViewStory").onclick = peDC.initMapViewStory;
        });

        // chapterData page
        $(document).on("pagebeforeshow", "#chapterData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow:  chapterData");
            // Good time to bind
        });

        $(document).on("pagebeforehide", "#chapterData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforehide:  chapterData");
            // Good time to bind
        });

        $(document).on("pagebeforecreate", "#chapterData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforecreate:  chapterData");
            // Good time to augment
        });

        $(document).on("pagecreate", "#chapterData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate:  chapterData");
            // Page loaded into DOM
            document.getElementById("chapterAuthorManagement").onclick =
            peDC.initAuthorManagement.bind(this, createChapter, removeAuthorFromChapter);
            document.getElementById("submitChapterButton").onclick = peDC.submitChapterData;
            document.getElementById("deleteChapterBtn").onclick = peDC.deleteChapterData;

            // FIXME:  Change this so that call initMapViewChapter on page/poppup display.
            document.getElementById("openMapViewChapter").onclick = peDC.initMapViewChapter;
        });

        // eventData page
        $(document).on("pagebeforeshow", "#eventData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow:  eventData");
            // Good time to bind
        });

        $(document).on("pagebeforehide", "#eventData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforehide:  eventData");
            // Good time to bind
        });

        $(document).on("pagebeforecreate", "#eventData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforecreate:  eventData");
            // Good time to augment
        });

        $(document).on("pagecreate", "#eventData", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate:  eventData");
            // Page loaded into DOM

            document.getElementById("eventAuthorManagement").onclick =
            peDC.initAuthorManagement.bind(this, createEvent, removeAuthorFromEvent);

            document.getElementById("submitEventButton").onclick = peDC.submitEventData;
            document.getElementById("deleteEventBtn").onclick = peDC.deleteEventData;

            document.getElementById("openMapViewEvent").onclick = peDC.initMapViewEvent;

            document.getElementById("addAssetButton").onclick = peDC.addNewAsset;
            document.getElementById("assetEditorSubmitButton").onclick = peDC.addAssetToEvent;

        });

        // authorView page
        $(document).on("pagebeforeshow", "#authorView", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforeshow:  authorView");
            // Good time to bind
        });

        $(document).on("pagebeforecreate", "#authorView", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagebeforecreate:  authorView");
            // Good time to augment
        });

        $(document).on("pagecreate", "#authorView", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "Pagecreate:  authorView");
            // Page loaded into DOM
        });

        // mapView page
        $(document).on("pageshow", "#mapView", function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "PageShow:  mapView");
            google.maps.event.trigger(document.getElementById("map_canvas"), 'resize');
        });

        /*
         ************ Public methods *************
         */

        /*
         * Setup
         */

        /**
         * Checks to see if user has previously logged in.
         * @returns {undefined}
         */
        peDC.autoLogin = function () {
            // If previously logged in (Check via server code), show main menu
            peDS.checkAuth(function (authInfo) {
                mhLog.log(mhLog.LEVEL.DEBUG, "authorInfo = " + JSON.stringify(authInfo));
                mhLog.log(mhLog.LEVEL.DEBUG, "authorInfo.loggedIn = " + authInfo.loggedIn);
                if (authInfo.loggedIn) {
                    peDC.showMainMenu();
                }
            });
        };

        /*
         * mainMenu Methods
         */

        /**
         * This initializes the main menu view.  It is exported so can use in peDesignerMain.html to
         * bypass needing to login for testing purposes.  Normally, only called within this module.
         * @returns {undefined}
         */
        peDC.showMainMenu = function () {
            // get author data and save it, if necessary, and display welcome message
            if (typeof authorData === 'undefined') {
                mhLog.log(mhLog.LEVEL.DEBUG, "showMainMenu:  author is undefined");
                // includes fetching author stories, chapters, and events!!!!
                peDS.getAuthorData(useAuthorData);
            }
            else {
                mhLog.log(mhLog.LEVEL.DEBUG, "showMainMenu:  author is defined");
                useAuthorData(authorData);
            }
        };

        /*
         * #storyManager Methods
         */

        /**
         * Adds list of existing stories authored by user to the storyManager page
         * @returns {undefined}
         */
        peDC.initStoryManager = function () {
            populateStoryList();
        };

        /**
         * Setup form to update a chapter with known fields supplied.
         * @param {String} id - Database identifier for the story.
         * @returns {undefined}
         */
        peDC.updateStory = function (id) {
            mhLog.log(mhLog.LEVEL.DEBUG, "In updateStory: " + createStory);
            var title = document.getElementById("storyDataTitle");
            title.innerHTML = "Update Story";
            var story = peDM.findStoryByID(id);
            if (story) {
                createStory.title.value = story.title;
                createStory.authors.value = story.authors ? story.authors.toString().replace(/,/g, " ") : "";
                createStory.publish.checked = story.publish;
                createStory.test.checked = story.test;
                createStory.keywords.value = story.keywords ? story.keywords.toString().replace(/,/g, " ") : "";
                //createStory.overview.value = story.overview;
                $(".rteOverview").jqteVal(story.overview);
                createStory.image.value = story.image;
                createStory.slat.value = story.proximity.lat;
                createStory.slng.value = story.proximity.lng;
                createStory.srange.value = story.proximity.range;
                createStory.chapters.value = story.chapterList ? story.chapterList.toString().replace(/,/g, " ") : "";
                updateStoryID = story._id;
            }

            var delButton = document.getElementById("deleteStoryBtn");
            delButton.style.display = "block";
            $('#storyDataFooter').trigger('refresh');
            populateStoryChapterList(story);
            // Due to Jquery Mobile, need to refresh checkboxes (this must be last or
            // will cause an error on the first use and won't do code that comes afterwards)
            /*$("#storyData").page({
             create: function(event, ui) {
             $("#publish").checkboxradio("refresh");
             $("#test").checkboxradio("refresh");
             }
             });*/
            $("#publish").checkboxradio();
            $("#test").checkboxradio();
            $("#publish").checkboxradio("refresh");
            $("#test").checkboxradio("refresh");
        };

        /**
         * Setup blank story creation form.
         * @returns {undefined}
         */
        peDC.createStory = function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "In createStory: " + JSON.stringify(createStory));
            var title;
            title = document.getElementById("storyDataTitle");
            title.innerHTML = "Create Story";
            createStory.authors.value = peDC.getAuthorData()._id;
            var delButton = document.getElementById("deleteStoryBtn");
            delButton.style.display = "none";
            $('#storyDataFooter').trigger('refresh');
            populateStoryChapterList(undefined);
        };
        /*
         * #chapterManager Methods
         */

        /**
         * Adds list of existing chapters authored by user to the chapterManager page
         * @returns {undefined}
         */
        peDC.initChapterManager = function () {
            populateChapterList();
        };

        /**
         * Setup form to update a chapter with known fields supplied.
         * @param {String} id - Database identifier for chapter.
         * @returns {undefined}
         */
        peDC.updateChapter = function (id) {
            var title = document.getElementById("chapterDataTitle");
            title.innerHTML = "Update Chapter";
            var chapter = peDM.findChapterByID(id);
            if (chapter) {
                createChapter.ctitle.value = chapter.title;
                createChapter.cteaser.value = chapter.teaser;
                createChapter.cauthors.value = chapter.authors ? chapter.authors.toString().replace(/,/g, " ") : "";
                createChapter.ckeywords.value = chapter.keywords.toString().replace(/,/g, " ");
                //createChapter.coverview.value = chapter.overview;
                $(".rteCoverview").jqteVal(chapter.overview);
                createChapter.cimage.value = chapter.image;
                createChapter.clat.value = chapter.proximity.lat;
                createChapter.clng.value = chapter.proximity.lng;
                createChapter.crange.value = chapter.proximity.range;
                createChapter.cevents.value = chapter.eventList ? chapter.eventList.toString().replace(/,/g, " ") : "";
                updateChapterID = chapter._id;
            }

            var delButton = document.getElementById("deleteChapterBtn");
            delButton.style.display = "block";
            $('#chapterDataFooter').trigger('refresh');
            populateChapterEventList(chapter);
        };

        /**
         * Setup blank chapter creation form.
         * @returns {undefined}
         */
        peDC.createChapter = function () {
            var title;
            title = document.getElementById("chapterDataTitle");
            title.innerHTML = "Create Chapter";
            createChapter.cauthors.value = peDC.getAuthorData()._id;
            var delButton = document.getElementById("deleteChapterBtn");
            delButton.style.display = "none";
            $('#chapterDataFooter').trigger('refresh');
            populateChapterEventList(undefined);
        };

        /*
         * #eventManager Methods
         */

        /**
         * Adds list of existing events authored by user to the eventManager page
         * @returns {undefined}
         */
        peDC.initEventManager = function () {
            populateEventList();
        };

        /**
         * Setup form to update an event with known fields supplied.
         * @param {String} id - Database identifier for event.
         * @returns {undefined}
         */
        peDC.updateEvent = function (id) {
            var title = document.getElementById("eventDataTitle");
            var i;
            title.innerHTML = "Update Event";
            var event = peDM.findEventByID(id);
            if (event) {
                createEvent.etitle.value = event.title;
                createEvent.eteaser.value = event.teaser;
                createEvent.eauthors.value = event.authors ? event.authors.toString().replace(/,/g, " ") : "";
                createEvent.ekeywords.value = event.keywords ? event.keywords.toString().replace(/,/g, " ") : "";
                if (event.proximity) {
                    createEvent.elat.value = event.proximity.lat;
                    createEvent.elng.value = event.proximity.lng;
                    createEvent.erange.value = event.proximity.range;
                }
                if (event.assetList) {
                    for (i = 0; i < event.assetList.length; i++) {
                        addToAssetList(event.assetList[i].order, event.assetList[i].format, event.assetList[i].uri);
                    }
                }

                updateEventID = event._id;
                if ($('#eassetList').hasClass('ui-listview')) {
                    $("#eassetList").listview("refresh");
                }
            }

            var delButton = document.getElementById("deleteEventBtn");
            delButton.style.display = "block";
            $('#eventDataFooter').trigger('refresh');
            // Due to Jquery Mobile, need to refresh checkboxes (this must be last or
            // will cause an error on the first use and won't do code that comes afterwards)
            $("#erepeats").checkboxradio("refresh");
        };

        /**
         * Setup blank event creation form.
         * @returns {undefined}
         */
        peDC.createEvent = function () {
            var title;
            title = document.getElementById("eventDataTitle");
            title.innerHTML = "Create Event";
            createEvent.eauthors.value = peDC.getAuthorData()._id;
            var delButton = document.getElementById("deleteEventBtn");
            delButton.style.display = "none";
            $('#eventDataFooter').trigger('refresh');
            // Future work:  Right now...assets are encoded a different way
            //populateChapterEventList(undefined);

        };

        /*
         * Author Management Methods
         */

        /**
         * Fill out current author list for author management popup
         * @param {form} form pointer to the form currently in use
         * @param {function} removeAuthor the function that will be used to remove an author
         * from this list
         * @returns {undefined}
         */
        peDC.initAuthorManagement = function (form, removeAuthor) {
            var addAuthorTo;

            if (form === createStory) {
                addCurrentAuthors(form.authors, removeAuthor);
                addAuthorTo = addAuthorToStory;
            } else if (form === createChapter) {
                addCurrentAuthors(form.cauthors, removeAuthor);
                addAuthorTo = addAuthorToChapter;
            } else if (form === createEvent) {
                addCurrentAuthors(form.eauthors, removeAuthor);
                addAuthorTo = addAuthorToEvent;
            }

            document.getElementById("authorSearch").onkeypress =
            peDC.authorSearch.bind(this, addAuthorTo);

        };

        peDC.authorSearch = function (addAuthorTo, event) {
            var authorSearchText;
            var re = /\s+/;
            if (event.keyCode === 13) {
                authorSearchText = document.getElementById("authorSearch").value;
                // check for reasonable number of search terms
                if (authorSearchText && authorSearchText.trim().split(re).length < 3) {
                    //startSpinner();  // spinner stopped in "populateAuthorSearchList"
                    peDS.authorSearch(authorSearchText, populateAuthorSearchList.bind(this, addAuthorTo));
                    //FIXME:  Need to write pePS.authorSearch like function above located in Player
                } else {
                    document.getElementById("authorSearch").value = "Invalid Search Text...Try again.";
                }
            }

        };

        /*
         * #storyData Methods
         */

        /**
         * Implements "submit story" button
         * @returns {undefined}
         */
        peDC.submitStoryData = function () {
            var msg;
            if (requiredStoryFieldsPresent()) {
                mhLog.log(mhLog.LEVEL.DEBUG, "submitStoryData: " + JSON.stringify(createStory));

                var storyData = {};
                storyData.title = createStory.title.value;
                if (createStory.authors.value !== "") {
                    storyData.authors = createStory.authors.value.split(" ");
                }
                storyData.publish = createStory.publish.checked;
                storyData.test = createStory.test.checked;
                if (createStory.keywords.value !== "") {
                    storyData.keywords = createStory.keywords.value.split(" ");
                }
                storyData.overview = createStory.overview.value;
                storyData.image = createStory.image.value;
                storyData.proximity = {};
                storyData.proximity.lat = createStory.slat.value;
                storyData.proximity.lng = createStory.slng.value;
                storyData.proximity.range = createStory.srange.value;
                if (createStory.chapters.value !== "") {
                    storyData.chapterList = createStory.chapters.value.replace(/(^\s+|\s+$)/g, '');
                    storyData.chapterList = storyData.chapterList.split(" ");
                }
                mhLog.log(mhLog.LEVEL.DEBUG, "Chapter List is " + storyData.chapterList);
                mhLog.log(mhLog.LEVEL.DEBUG, "submitStoryData: storyData: " + JSON.stringify(storyData));

                if (updateStoryID === 0) {
                    msg = "Adding story to server. \nHit \"ok\" to return to main menu!";
                    peDS.submitNewStory(storyData, authorData, populateStoryList);
                }
                else {
                    msg = "Updating story on server. \nHit \"ok\" to return to main menu!";
                    peDS.submitUpdateStory(updateStoryID, storyData, populateStoryList);
                }

                alert(msg);
                $.mobile.changePage("#storyManager", {reverse: true});
            } else {
                msg = "Missing required data.  Please ensure you have valid values for both the title and authors fields.";
                alert(msg);
            }
        };

        /**
         * Checks that story has at least one chapter with at least one event.
         * @param {Event} e
         * @returns {Boolean}
         */
        peDC.validateStoryPublish = function (e) {
            var chapterList;
            if (createStory.publish.checked === true) {
                if (createStory.chapters.value !== "") {
                    chapterList = createStory.chapters.value.replace(/(^\s+|\s+$)/g, '').split(" ");
                    if (chapterList.length > 0) {
                        if (peDC.validateChaptersPublish(chapterList)) {
                            alert("Valid Story!");
                            return true;
                        }
                    }
                }
                this.checked = false;
                alert("Invalid Story!");
                return false;
            }

            alert("Marking not Publishable!");
            return true;
            // First, must check that this story has a chapter list and that
            // each chapter has at least one event.  Eventually, could check all fields
            // for reasonableness.  Also, eventually, will need to mark story as not
            // published if a change to a critical field is made.  This will cause
            // the author to have to click "publish" again which will run the validity
            // check.
        };

        /**
         * Implements the "Delete" story button.
         * @returns {undefined}
         */
        peDC.deleteStoryData = function () {
            if (confirm("Do you really want to delete this story?")) {
                mhLog.log(mhLog.LEVEL.DEBUG, "Delete Story");
                peDS.submitDeleteStory(updateStoryID, authorData, populateStoryList);
                //clearStoryData();
                // This is 1.4:  $(":mobile-pagecontainer").pagecontainer("change", "#storyManager");
                $.mobile.changePage("#storyManager", {reverse: true});
            }
        };

        /*
         * #chapterData Methods
         */

        /**
         * Implements "submit chapter" button
         * @returns {undefined}
         */
        peDC.submitChapterData = function () {
            var msg;

            if (requiredChapterFieldsPresent()) {
                var chapterData = {};
                chapterData.title = createChapter.ctitle.value;
                chapterData.teaser = createChapter.cteaser.value;
                if (createChapter.cauthors.value !== "") {
                    chapterData.authors = createChapter.cauthors.value.split(" ");
                }
                if (createChapter.ckeywords.value !== "") {
                    chapterData.keywords = createChapter.ckeywords.value.split(" ");
                }
                chapterData.overview = createChapter.coverview.value;
                chapterData.image = createChapter.cimage.value;
                chapterData.proximity = {};
                chapterData.proximity.lat = createChapter.clat.value;
                chapterData.proximity.lng = createChapter.clng.value;
                chapterData.proximity.range = createChapter.crange.value;
                if (createChapter.cevents.value) {
                    chapterData.eventList = createChapter.cevents.value.replace(/(^\s+|\s+$)/g, '');
                    chapterData.eventList = chapterData.eventList.split(" ");
                }
                if (updateChapterID === 0) {
                    msg = "Adding chapter to server. \nHit \"ok\" to return to main menu!";
                    peDS.submitNewChapter(chapterData, populateChapterList);
                }
                else {
                    msg = "Updating chapter on server. \nHit \"ok\" to return to main menu!";
                    peDS.submitUpdateChapter(updateChapterID, chapterData, populateChapterList);
                }

                alert(msg);
                //clearChapterData();
                $.mobile.changePage("#chapterManager", {reverse: true});
            } else {
                msg = "Missing required data.  Please ensure you have valid values for the title, authors, latitude, longitude, and range fields.";
                alert(msg);
            }
        };

        /**
         * Insure chapter is valid (has events)
         * @param {type} chapterList
         * @returns {Boolean}
         */
        peDC.validateChaptersPublish = function (chapterList) {

            var i, len, chap;
            for (i = 0, len = chapterList.length; i < len; i++) {
                chap = peDM.findChapterByID(chapterList[i]);
                if (chap.eventList && chap.eventList.length < 1) {
                    return false;
                }
            }

            return true;
        };

        /**
         * Implements "Delete Chapter" button
         * @returns {undefined}
         */
        peDC.deleteChapterData = function () {
            if (confirm("Do you really want to delete this chapter?")) {
                mhLog.log(mhLog.LEVEL.DEBUG, "Delete Chapter");
                peDS.submitDeleteChapter(updateChapterID, populateChapterList);
                //clearChapterData();
                $.mobile.changePage("#chapterManager", {reverse: true});
            }
        };

        /*
         * #eventData Methods
         */

        /**
         * Implements "add asset" button in Event manager
         * @returns {undefined}
         */
        peDC.addNewAsset = function () {
            mhLog.log(mhLog.LEVEL.DEBUG, "addNewAsset called!");
            // Need to populate order list

            document.getElementById("assetEditorTitle").innerHTML = "Asset Editor";
            document.getElementById("assetEditorSubmitButton").onclick = peDC.addAssetToEvent;
        };

        /**
         * Implements "add" button in "Asset Editor" popup
         * @returns {undefined}
         */
        peDC.addAssetToEvent = function () {
            addToAssetList(editAssetPopup.assetOrderSelect.value, editAssetPopup.assetTypeSelect.value,
                           editAssetPopup.assetDATA.value);
            if ($('#eassetList').hasClass('ui-listview')) {
                $("#eassetList").listview("refresh");
            }
        };

        /**
         * Implements "submit event" button          * @returns {undefined}
         */
        peDC.submitEventData = function () {
            var msg, i, len;

            if (requiredEventFieldsPresent()) {
                var eventData = {};
                eventData.title = createEvent.etitle.value;
                eventData.teaser = createEvent.eteaser.value;
                if (createEvent.eauthors.value !== "") {
                    eventData.authors = createEvent.eauthors.value.split(" ");
                }
                if (createEvent.ekeywords.value !== "") {
                    eventData.keywords = createEvent.ekeywords.value.split(" ");
                }
                eventData.proximity = {};
                eventData.proximity.lat = createEvent.elat.value;
                eventData.proximity.lng = createEvent.elng.value;
                eventData.proximity.range = createEvent.erange.value;
                var ul = document.getElementById("eassetList");
                var childNodes = ul.getElementsByTagName("li");
                // Pulls assets from dynamically constructed list
                eventData.assetList = [];
                for (i = 0, len = childNodes.length; i < len; i++) {
                    eventData.assetList[i] = {};
                    eventData.assetList[i].order = childNodes[i].peOrder;
                    eventData.assetList[i].format = childNodes[i].peType;
                    eventData.assetList[i].uri = childNodes[i].peData;
                }

                mhLog.log(mhLog.LEVEL.DEBUG, "Asset List is " + eventData.assetList);
                if (updateEventID === 0) {
                    msg = "Adding event to server. \nHit \"ok\" to return to main menu!";
                    peDS.submitNewEvent(eventData, populateEventList);
                }
                else {
                    msg = "Updating event on server. \nHit \"ok\" to return to main menu!";
                    peDS.submitUpdateEvent(updateEventID, eventData, populateEventList);
                }

                alert(msg);
                //clearEventData();
                $.mobile.changePage("#eventManager", {reverse: true});
            } else {
                msg = "Missing required data.  Please ensure you have valid values for the title, authors, latitude, longitude, and range fields.";
                alert(msg);
            }
        };

        /**
         * Implements "Delete Event" button
         * @returns {undefined}
         */
        peDC.deleteEventData = function () {
            if (confirm("Do you really want to delete this event?")) {
                peDS.submitDeleteEvent(updateEventID, populateEventList);
                //clearEventData();
                $.mobile.changePage("#eventManager", {reverse: true});

            }
        };

        /*
         *
         * Map Methods
         */

        /**
         * Sets the map to record the geolocation points in the correct position
         * @returns {undefined}
         */
        peDC.initMapViewStory = function () {
            // map for finding geolocation points
            mhLog.log(mhLog.LEVEL.DEBUG, "initMapViewStory called.");

            document.getElementById("useLocationButton").onclick = setStoryGeolocationPoints;
        };

        /**
         * Sets the map to record the geolocation points in the correct position
         * @returns {undefined}
         */
        peDC.initMapViewChapter = function () {
            // map for finding geolocation points
            document.getElementById("useLocationButton").onclick = setChapterGeolocationPoints;
        };

        /**
         * Sets the map to record the geolocation points in the correct position
         * @returns {undefined}
         */
        peDC.initMapViewEvent = function () {
            // map for finding geolocation points
            document.getElementById("useLocationButton").onclick = setEventGeolocationPoints;
        };

        /*
         * Accessor Methods
         */

        /**
         * When submitting data, peDS needs to use authorData.  Could just store
         * author data in peDS too.  Right now, easier to keep in one place...here.
         * @returns {adata}
         */
        peDC.getAuthorData = function () {
            return authorData;
        };

        /*
         ************ Private methods *************
         */

        /*
         * Methods for #mainMenu
         */

        function populateAuthorSearchList(addAuthorTo, authors) {
            var ul, li, a;
            if (authors) {
                mhLog.log(mhLog.LEVEL.DEVELOPMENT, "populateAuthorSearchList: authors : " + JSON.stringify(authors));
                ul = document.getElementById("potentialAuthors");
                wipeChildrenList(ul);
                li = document.createElement("li");
                li.innerHTML = "<a href=''>" + authors.name + "</a>";
                a = document.createElement("a");
                a.href = '';
                a.onclick = addAuthorTo.bind(this, authors, li, ul);  // jshint ignore:line
                a.innerHTML = 'Add Author';
                li.appendChild(a);
                ul.appendChild(li);
                if ($('#potentialAuthors').hasClass('ui-listview')) {
                    $("#potentialAuthors").listview("refresh");
                }
            }
        }

        /**
         * Used as a callback in "showMainMenu". Display custom welcome message to user.
         * @param {type} adata
         * @returns {undefined}
         */
        function useAuthorData(adata) {
            authorData = adata;
            mhLog.log(mhLog.LEVEL.DEBUG, "In setAuthorData: " + JSON.stringify(authorData));
            $.mobile.changePage("#mainMenu");
            var greeting = document.getElementById("userGreeting");
            greeting.innerHTML = "<center><i>Welcome, " + authorData.name + "</i>.  Click a button below to manage your stories, chapters, or events.</center>";
        }

        /*
         * Methods for #storyManager
         */

        /**
         * Populates id=existingStoryList with stories owned/created by author.
         * @returns {undefined}
         */
        function populateStoryList() {
            var i, ul, li;
            // clear out story list
            ul = document.getElementById("existingStoryList");
            wipeChildrenList(ul);
            // Fill out story list
            for (i = 0; i < peDM.storyMap.length; i++) {
                li = document.createElement("li");
                li.innerHTML = "<a href='#storyData'>" + peDM.storyMap[i].title + "</a>";
                li.onclick = listHelper(peDM.storyMap[i]._id, peDC.updateStory);
                ul.appendChild(li);
            }

            // For dynamically created html, need to refresh via jquery in order
            // to get jquery mobile look and feel.
            if ($('#existingStoryList').hasClass('ui-listview')) {
                $("#existingStoryList").listview("refresh");
            }
        }

        /**
         * When creating/updating a Story, need a list of chapters the user can choose to associate with this story.
         * @param {Array} existingChapters
         * @returns {undefined}
         */
        function populateStoryChapterCheckboxes(existingChapters) {
            var i, divContainer, label, input;
            var duplicate = false;
            // clear out checkboxes
            divContainer = document.getElementById("chapterCheckboxes");
            divContainer.innerHTML = "";
            // Fill out chapter checkboxes
            for (i = 0; i < peDM.chapterMap.length; i++) {
                if (existingChapters) {
                    if (existingChapters.indexOf(peDM.chapterMap[i]._id) > -1) {
                        duplicate = true;
                    }
                }

                input = document.createElement("input");
                input.type = "checkbox";
                input.name = peDM.chapterMap[i]._id;
                input.id = input.name;
                input.onclick = toggleIDinList.bind(window, input, 'chapters');
                if (duplicate) {
                    input.checked = true;
                }
                label = document.createElement("label");
                label.htmlFor = input.name;
                label.appendChild(document.createTextNode("ID: " + input.name + ", Title: " + peDM.chapterMap[i].title));
                divContainer.appendChild(label);
                divContainer.appendChild(input);
                // reset duplicate flag
                duplicate = false;
            }

            // For dynamically created html, need to refresh via jquery in order to get jquery mobile
            // look and feel.
            $("#chapterCheckboxes").trigger('create');
        }

        /**
         * If this is an update, not a new creation, then need to call populateStoryCheckboxes()
         * with the chapters already associated with the story.
         * @param {Story} story
         * @returns {undefined}
         */
        function populateStoryChapterList(story) {
            var existingChapters;
            if (story) {
                if (story.chapterList !== "") {
                    existingChapters = story.chapterList.toString().split(",");
                }
            }
            populateStoryChapterCheckboxes(existingChapters);
        }

        /*
         * Methods for #chapterManager
         */

        /**
         * Populates id=existingChapterList with chapters owned/created by author.          * @returns {undefined}
         */
        function populateChapterList() {
            var i, ul, li;
            // clear out chapter list
            ul = document.getElementById("existingChapterList");
            wipeChildrenList(ul);
            // Fill out chapter list
            for (i = 0; i < peDM.chapterMap.length; i++) {
                li = document.createElement("li");
                li.innerHTML = "<a href='#chapterData'>" + peDM.chapterMap[i].title + "</a>";
                li.onclick = listHelper(peDM.chapterMap[i]._id, peDC.updateChapter);
                ul.appendChild(li);
            }

            // For dynamically created html, need to refresh via jquery in order
            // to get jquery mobile look and feel.
            if ($('#existingChapterList').hasClass('ui-listview')) {
                $("#existingChapterList").listview("refresh");
            }
        }

        /**
         * When creating/updating a Chapter, need a list of events the user can choose to associate with this chapter.
         * @param {Array} existingEvents
         * @returns {undefined}
         */
        function populateChapterEventCheckboxes(existingEvents) {
            var i, divContainer, label, input;
            var duplicate = false;
            // clear out checkboxes
            divContainer = document.getElementById("eventCheckboxes");
            divContainer.innerHTML = "";
            // Fill out event checkboxes
            for (i = 0; i < peDM.eventMap.length; i++) {
                if (existingEvents) {
                    if (existingEvents.indexOf(peDM.eventMap[i]._id) > -1) {
                        duplicate = true;
                    }
                }

                input = document.createElement("input");
                input.type = "checkbox";
                input.name = peDM.eventMap[i]._id;
                input.id = input.name;
                input.onclick = toggleIDinList.bind(window, input, 'cevents');
                if (duplicate) {
                    input.checked = true;
                }
                label = document.createElement("label");
                label.htmlFor = input.name;
                label.appendChild(document.createTextNode("ID: " + input.name + ", Title: " + peDM.eventMap[i].title));
                divContainer.appendChild(label);
                divContainer.appendChild(input);
                // reset duplicate flag
                duplicate = false;
            }

            // For dynamically created html, need to refresh via jquery in order to get jquery mobile
            // look and feel.
            $("#eventCheckboxes").trigger('create');
        }

        /**
         * If this is an update, not a new creation, then need to call populateChapterCheckboxes()
         * with the events already associated with the chapter.
         * @param {Chapter} chapter
         * @returns {undefined}
         */
        function populateChapterEventList(chapter) {
            var existingEvents;
            if (chapter) {
                if (chapter.eventList !== undefined) {
                    existingEvents = chapter.eventList.toString().split(",");
                }
            }
            populateChapterEventCheckboxes(existingEvents);
        }

        /*
         * Methods for #eventManager
         */

        /**
         * fill out event list (populated with events owned/created by author)
         * @returns {undefined}
         */
        function populateEventList() {
            var i, ul, li;
            // clear out event list
            ul = document.getElementById("existingEventList");
            wipeChildrenList(ul);
            // Fill out event list
            for (i = 0; i < peDM.eventMap.length; i++) {
                li = document.createElement("li");
                li.innerHTML = "<a href='#eventData'>" + peDM.eventMap[i].title + "</a>";
                li.onclick = listHelper(peDM.eventMap[i]._id, peDC.updateEvent);
                ul.appendChild(li);
            }

            // For dynamically created html, need to refresh via jquery in order
            // to get jquery mobile look and feel.
            if ($('#existingEventList').hasClass('ui-listview')) {
                $("#existingEventList").listview("refresh");
            }
        }

        /*
         * #authorView Methods
         */

        /**
         * Add the current authors to the author management popup.
         * @param {DOM element} formAuthors Pointer to the field containing authors
         * @param {function} removeAuthor Function to remove author from story, chapter, or event
         */
        function addCurrentAuthors(formAuthors, removeAuthor) {
            var ul;
            var authors = formAuthors.value.split(" ");

            // wipe author search results and search input (from previous uses)
            wipeChildrenList(document.getElementById("potentialAuthors"));
            document.getElementById("authorSearch").value = "";

            ul = document.getElementById("currentAuthors");
            wipeChildrenList(ul);
            authors.forEach(function (element) {
                // Not including element index in callback because indices will change
                // after an element is removed
                var li = document.createElement("li");
                li.innerHTML = "<a href=''>" + element + "</a>";
                var a = document.createElement("a");
                a.href = '';
                a.onclick = removeAuthor.bind(this, li, ul);
                a.innerHTML = 'Delete Author';
                li.appendChild(a);
                ul.appendChild(li);
            });
            if ($('#currentAuthors').hasClass('ui-listview')) {
                $("#currentAuthors").listview("refresh");
            }
        }

        /*
         * #storyData Methods
         */

        function requiredStoryFieldsPresent() {
            return createStory.authors.value !== "" && createStory.title.value !== "" &&
            createStory.slat.value !== "" && createStory.slng.value !== "" &&
                   createStory.srange.value !== "";
        }

        /**
         * set geolocation field with values from map
         * @returns {undefined}
         */
        function setStoryGeolocationPoints() {
            // map for finding geolocation points
            mhLog.log(mhLog.LEVEL.DEBUG, "setStoryGeolocationPoints called.");

            createStory.slat.value = document.getElementById("latspan").innerHTML;
            createStory.slng.value = document.getElementById("lngspan").innerHTML;
        }

        /**
         * Clear form fields
         * @returns {undefined}
         */
        function clearStoryData() {
            mhLog.log(mhLog.LEVEL.DEBUG, "clearStoryData called.");
            createStory.title.value = "";
            createStory.authors.value = "";
            createStory.publish.checked = false;
            createStory.test.checked = false;
            createStory.keywords.value = "";
            //createStory.overview.value = "";
            $(".rteOverview").jqteVal("");
            createStory.image.value = "";
            createStory.slat.value = "";
            createStory.slng.value = "";
            createStory.srange.value = "";
            createStory.chapters.value = "";
            updateStoryID = 0;

            // Eliminates error message that can refresh unitialized checkboxes on the first call to this method
            $("#publish").checkboxradio();
            $("#test").checkboxradio();

            $("#publish").checkboxradio("refresh");
            $("#test").checkboxradio("refresh");
        }

        /**
         * Remove the author specifed in "li" from "ul" and the story
         * @param {DOM list element} li
         * @param {Dom unordered list} ul
         */
        function removeAuthorFromStory(li, ul) {
            var storyAuthors;
            var storyAuthorsArray;

            if (ul.firstChild === ul.lastChild) {
                alert("You cannot remove the last author.\nDelete Story instead. ");
                return;
            } else {
                ul.removeChild(li);
                storyAuthors = document.getElementById("authors");
                storyAuthorsArray = storyAuthors.value.toString().split(" ");
                storyAuthorsArray.splice(storyAuthorsArray.indexOf(li.textContent.trim()), 1);  // returns removed item
                storyAuthors.value = storyAuthorsArray;
            }
            if ($('#currentAuthors').hasClass('ui-listview')) {
                $("#currentAuthors").listview("refresh");
            }
        }

        /**
         * Remove the author specifed in "li" from "ul" and add to the story
         * @param {User Object} author The author to add to the authors List
         * @param {DOM list element} li          * @param {Dom unordered list} ul
         */
        function addAuthorToStory(author, li, ul) {
            var storyAuthors;
            var storyAuthorsArray;

            mhLog.log(mhLog.LEVEL.DEVELOPMENT, "addAuthorStory: " + author._id);

            ul.removeChild(li);
            storyAuthors = document.getElementById("authors"); // Abstract Tag
            if (storyAuthors.value.indexOf(author._id) === -1) {  // No duplicates
                storyAuthors.value = storyAuthors.value.concat(" " + author._id);
                addCurrentAuthors(createStory.authors, removeAuthorFromStory);  //this also refreshes '#currentAuthors'..no problem detected
            } else {
                mhLog.log(mhLog.LEVEL.PRODUCTION, "addAuthorToStory:  Found duplicate.");
            }

            if ($('#currentAuthors').hasClass('ui-listview')) {
                $("#currentAuthors").listview("refresh");
            }
        }

        /*
         * #chapterData Methods
         */

        function requiredChapterFieldsPresent() {
            return createChapter.cauthors.value !== "" && createChapter.ctitle.value !== "" &&
                   createChapter.clat.value !== "" && createChapter.clng.value !== "" &&
                   createChapter.crange.value !== "";
        }

        /**
         * Remove the author specifed in "li" from "ul" and the chapter
         * @param {DOM list element} li
         * @param {Dom unordered list} ul
         */
        function removeAuthorFromChapter(li, ul) {
            var chapterAuthors;
            var chapterAuthorsArray;

            if (ul.firstChild === ul.lastChild) {
                alert("You cannot remove the last author. ");
                return;
            } else {
                ul.removeChild(li);
                chapterAuthors = document.getElementById("cauthors");
                chapterAuthorsArray = chapterAuthors.value.toString().split(" ");
                chapterAuthorsArray.splice(chapterAuthorsArray.indexOf(li.textContent.trim()), 1);  // returns removed item
                chapterAuthors.value = chapterAuthorsArray;
            }
            if ($('#currentAuthors').hasClass('ui-listview')) {
                $("#currentAuthors").listview("refresh");
            }
        }

        /**
         * Remove the author specifed in "li" from "ul" and add to the Chapter
         * @param {User Object} author The author to add to the authors List
         * @param {DOM list element} li
         * @param {Dom unordered list} ul
         */
        function addAuthorToChapter(author, li, ul) {
            var chapterAuthors;
            var chapterAuthorsArray;

            mhLog.log(mhLog.LEVEL.DEVELOPMENT, "addAuthorToChapter: " + author._id);

            ul.removeChild(li);
            chapterAuthors = document.getElementById("cauthors"); // Abstract Tag
            if (chapterAuthors.value.indexOf(author._id) === -1) {  // No duplicates
                chapterAuthors.value = chapterAuthors.value.concat(" " + author._id);
                addCurrentAuthors(createChapter.cauthors, removeAuthorFromChapter);  //this also refreshes '#currentAuthors'..no problem detected
            }

            if ($('#currentAuthors').hasClass('ui-listview')) {
                $("#currentAuthors").listview("refresh");
            }
        }

        /**
         * set geolocation field with values from map
         * @returns {undefined}
         */
        function setChapterGeolocationPoints() {
            // map for finding geolocation points
            createChapter.clat.value = document.getElementById("latspan").innerHTML;
            createChapter.clng.value = document.getElementById("lngspan").innerHTML;
        }

        /**
         * Clear form fields
         * @returns {undefined}
         */
        function clearChapterData() {
            createChapter.ctitle.value = "";
            createChapter.cteaser.value = "";
            createChapter.cauthors.value = "";
            createChapter.ckeywords.value = "";
            //createChapter.coverview.value = "";
            $(".rteCoverview").jqteVal("");
            createChapter.cimage.value = "";
            createChapter.clat.value = "";
            createChapter.clng.value = "";
            createChapter.crange.value = "";
            createChapter.cevents.value = "";
            updateChapterID = 0;
        }

        /*
         * #eventData methods
         */

        function requiredEventFieldsPresent() {
            return createEvent.eauthors.value !== "" && createEvent.etitle.value !== "" &&
                   createEvent.elat.value !== "" && createEvent.elng.value !== "" &&
                   createEvent.erange.value !== "";
        }

        /**
         * Remove the author specifed in "li" from "ul" and the event
         * @param {DOM list element} li
         * @param {Dom unordered list} ul
         */
        function removeAuthorFromEvent(li, ul) {
            var eventAuthors;
            var eventAuthorsArray;

            if (ul.firstChild === ul.lastChild) {
                alert("You cannot remove the last author. ");
                return;
            } else {
                ul.removeChild(li);
                eventAuthors = document.getElementById("eauthors");
                eventAuthorsArray = eventAuthors.value.toString().split(" ");
                eventAuthorsArray.splice(eventAuthorsArray.indexOf(li.textContent.trim()), 1);  // returns removed item
                eventAuthors.value = eventAuthorsArray;
            }
            if ($('#currentAuthors').hasClass('ui-listview')) {
                $("#currentAuthors").listview("refresh");
            }
        }

        /**
         * Remove the author specifed in "li" from "ul" and add to the Event
         * @param {User Object} author The author to add to the authors List
         * @param {DOM list element} li          * @param {Dom unordered list} ul
         */
        function addAuthorToEvent(author, li, ul) {
            var eventAuthors;
            var eventAuthorsArray;

            mhLog.log(mhLog.LEVEL.DEVELOPMENT, "addAuthorToEvent: " + author._id);

            ul.removeChild(li);
            eventAuthors = document.getElementById("eauthors"); // Abstract Tag
            if (eventAuthors.value.indexOf(author._id) === -1) {  // No duplicates
                eventAuthors.value = eventAuthors.value.concat(" " + author._id);
                addCurrentAuthors(createEvent.eauthors, removeAuthorFromEvent);  //this also refreshes '#currentAuthors'..no problem detected
            }

            if ($('#currentAuthors').hasClass('ui-listview')) {
                $("#currentAuthors").listview("refresh");
            }
        }

        /**
         * Adds newly defined asset to an Event's asset list
         * @param {Number} order
         * @param {String} type
         * @param {String} data
         * @returns {undefined}
         */
        function addToAssetList(order, type, data) {
            var ul = document.getElementById("eassetList");
            var li = document.createElement("li");
            li.innerHTML = "<a href=''>Order: " + order + ", Type: " + type + ", Data: " + escape(data) + "</a>";
            // Note:  I don't like this hack....but, helps get this working for LAES tomorrow...
            li.peOrder = order;
            li.peType = type;
            li.peData = data;
            //li.onclick = listHelper(window.peDM.storyMap[i]._id, peDC.updateStory);

            var a = document.createElement("a");
            a.href = '#editAsset';
            a.setAttribute('data-rel', 'popup');
            a.setAttribute('data-position-to', 'window');
            a.setAttribute('data-transition', 'pop');
            // Typically "listHelper" puts the db id of the related item in a closure.  In this case,
            // I'm preserving the html element "a" in the closure.
            a.onclick = listHelper(li, showEditEventPopup);
            a.innerHTML = 'Edit Asset';
            li.appendChild(a);
            ul.appendChild(li);
        }

        /**
         * Display event editing popup.
         * @param {Element} li
         * @returns {undefined}
         */
        function showEditEventPopup(li) {
            /*jshint validthis:true */
            var removeBtn, editButton;
            mhLog.log(mhLog.LEVEL.DEBUG, "showEditEventPopup " + li.peOrder + " " + li.peType + " " + li.peData);
            // Need to assign click handlers to edit and remove buttons
            // those button handlers with then update user's data accordingly
            removeBtn = document.getElementById("deleteAssetButton");
            removeBtn.onclick = removeAssetFromList.bind(this, li);
            editButton = document.getElementById("editAssetButton");
            editButton.onclick = updateAssetInList.bind(this, li);
        }

        /**
         * Removes an asset from an Event's asset list.
         * @param {Element} li
         */
        function removeAssetFromList(li) {
            mhLog.log(mhLog.LEVEL.DEBUG, "removeEventFromList " + li.peOrder + " " + li.peType + " " + li.peData);
            var ul = document.getElementById("eassetList");
            ul.removeChild(li);
            if ($('#eassetList').hasClass('ui-listview')) {
                $("#eassetList").listview("refresh");
            }
        }

        /**
         * Displays popup to edit an asset.
         * @param {type} li
         * @returns {undefined}
         */
        function updateAssetInList(li) {
            /*jshint validthis:true */
            mhLog.log(mhLog.LEVEL.DEBUG, "updateEventInList " + li.peOrder + " " + li.peType + " " + li.peData);
            // Note:  Timeout is needed because jQuery mobile no longer allows popups to be chained.  So,
            // have to use Timeout to give extra time to make sure previous popup is closed.
            setTimeout(function () {
                $("#assetEditor").popup("open");
                document.getElementById("assetEditorTitle").innerHTML = "Asset Update";
                document.getElementById("assetEditorSubmitButton").onclick = updateAsset.bind(this, li);
                editAssetPopup.assetOrderSelect.value = li.peOrder;
                editAssetPopup.assetTypeSelect.value = li.peType;
                //editAssetPopup.assetDATA.value = li.peData;
                $(".rteAssetData").jqteVal(li.peData);
                //$("#assetOrderSelect").selectmenu("refresh");
                $("#assetTypeSelect").selectmenu("refresh");
            }, 100);
        }

        /**
         * TBD
         * @param {Element} li
         */
        function updateAsset(li) {
            removeAssetFromList(li);
            //$("#eassetList").listview("refresh");  // This is called in "removeEventFromList"
            peDC.addAssetToEvent();
        }

        /**
         * set geolocation field with values from map
         * @returns {undefined}
         */
        function setEventGeolocationPoints() {
            // map for finding geolocation points
            createEvent.elat.value = document.getElementById("latspan").innerHTML;
            createEvent.elng.value = document.getElementById("lngspan").innerHTML;
        }

        /**
         * Clear form fields
         * @returns {undefined}
         */
        function clearEventData() {
            createEvent.etitle.value = "";
            createEvent.eteaser.value = "";
            createEvent.eauthors.value = "";
            createEvent.ekeywords.value = "";
            createEvent.elat.value = "";
            createEvent.elng.value = "";
            createEvent.erange.value = "";
            var ul = document.getElementById("eassetList");
            wipeChildrenList(ul);
            updateEventID = 0;

            $(".rteAssetData").jqteVal("");
        }

        /*
         * General Display Utility Methods
         */

        function toggleIDinList(elem, target) {
            var list = document.getElementById(target);
            var listArray;
            if (elem.checked === true) {
                list.value = list.value + " " + elem.id;
            }
            else {
                listArray = list.value.split(" ");
                listArray.splice(listArray.indexOf(elem.id), 1);
                list.value = listArray.toString().replace(/,/g, " ");
            }
        }

        /*
         * Small utility function needed to capture a closure correctly.
         * @param {String} id
         * @param {function} updateFunction
         * @returns {unresolved}
         */
        function listHelper(id, updateFunction) {
            var savedID = id;
            return function () {
                updateFunction(savedID);
            };
        }

        /*
         * Module general private functions
         */

        /**
         * Wipes all child elements from a list element.
         * @param {Element} ul
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
        return peDC;
    };
    // Begin Module Footer
})(getGlobalContainer());
// End Module Footer

/*
 * If this is in a browser, then need to create/use a global variable
 * to hold module exports.  If this is in Node, use module.exports.
 * @returns {Object}
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