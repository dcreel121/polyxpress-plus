/**
 * @module pePlayerSocial
 * @name pePlayerSocial
 * @exports pePlayerSocial
 * @requires mhLog
 * @version 0.1 [June 28, 2016]
 * @author Desiree Creel
 * @copyright Copyright 2012 Michael Haungs [mhaungs at calpoly.edu]
 * @license MIT
 * @desc Deals with social networking functionalities.
 */

    // Begin Module Header
(function (container) {
    // End Module Header

    /**
     * By declaring these object containers here, they are captured in the
     * closure of the function assigned to container.exports.  Therefore,
     * all references to this module will get returned a function that when
     * executed will return the same object.
     */
    var pePlayerSocial = {};
    pePlayerSocial.test = {};

    /**
     * Assigning exports like this allows dependency injection
     * (aka var sample = require("./sample.js")(app);)
     */
    container.exports = function (pePC, pePS, pePM, config) {  // Passing a reference to pePlayerController to prevent circular requires

        /*
         * Configuration
         */
        "use strict"; // EMCAScript 5 pragma to catch more javascript errors
        var mhLog = config.mhLog;
        var selectedFriend;

        /***********************************************************************************************/
        /*                              Functions for notification view                                */
        /***********************************************************************************************/

        pePlayerSocial.showNotificationView = function() {
            mhLog.log(mhLog.LEVEL.DEBUG, "initializing notifications view");
            pePC.startSpinner();
            pePS.getNotifications(pePC.getAuthorData()._id, populateNotificationFeed);
            activateBackToNotificationsButton();

        }

        function populateNotificationFeed(messages) {
            mhLog.log(mhLog.LEVEL.DEBUG, "Populating notifications feed");
            console.log("Notifications:", messages.length);

            var title = "";
            if (messages.length == 1) {
                title = "You have 1 notification.";
            }
            else {
                title = "You have " + messages.length + " notifications.";
            }
            $("#notificationTitle").html(title);

            var list = $("#notificationFeed").listview();
            list.empty();

            var completedEvents = pePC.getAuthorData().eventCompletedList;

            for (var i = 0; i < messages.length; i++) {
                var item = messages[i];


                var li = document.createElement('li');
                li.setAttribute("class", "ui-li-has-thumb");
                
                var hrefLink;
                // Set the onclick depending if the user has previously completed the event
                if ($.inArray(item.event._id, completedEvents) > -1) {
                    li.onclick = listHelper(item, canViewComment);
                    hrefLink = "#canViewMessagePopup";
                }
                else {
                    li.onclick = listHelper(item.story._id, cannotViewComment);
                    hrefLink = "#noCanViewMessagePopup";
                }

                var img = document.createElement('img');
                img.src = 'https://graph.facebook.com/' + item.sender.facebook.id + '/picture?width=75&height=75';
                img.className = "ui-li-thumb";
                
                var a = createLinkDOM(hrefLink, null, null, 
                                      'The story \" ' + item.story.title + '\" has a comment waiting for you from ' + item.sender.name + '.',
                                       [{'key':'data-rel', 'value':'popup'}]);
                a.appendChild(img);
                li.appendChild(a);

                list.append(li);

            }

            $("#notificationFeed").listview("refresh");
                                            
        }

        function canViewComment(message) {
            // load up the Event with the comments showing
            // need to query for all messages with the given parameters
            // and display in order of times
            console.log("CAN VIEW COMMENT");

            // User wants to view the message
            $('#showEventMessageButton').on("click", function() {

                if (pePM.findEventByID(message.event._id) == -1) {
                    console.log("event not in cache.")
                    pePS.getStory(message.story._id, listHelper(message.event._id, pePC.showScrapbookView));
                    pePS.getMessages(pePC.getAuthorData()._id, message.event._id, pePlayerSocial.refreshConversations);

                }
                else {
                    //pePC.showEvent(message.chapter._id);
                    pePC.showScrapbookView(message.event._id);
                }
            });

         }

        /**
         * This function and the next are ghetto hacks to make the back button work 
         * for going from scrapbookview to notifications and chapter map view. 
         */
        function activateBackToNotificationsButton() {

            console.log("Activate back to notification button");
            $('#backToMapViewButton').attr("href", "#notificationView");
        }

        pePlayerSocial.activateBackToMapButton = function() {

            console.log("Activate back to map view button");
            $("#backToMapViewButton").attr("href", "#mapViewEvents");
        }

        function cannotViewComment(storyId) {
            console.log('CANNOT VIEW COMMENT');

            // Hide the "Add story to library" button if the user already has this story in its library.
            if ($.inArray(storyId, pePC.getAuthorData().readingList) > -1) {
                $('#addStoryLibraryButton').toggleClass("hide", true);
            }
            else {
                $('#addStoryLibraryButton').toggleClass("hide", false);
            }
            // Set add story to library onclick
            $('#addStoryLibraryButton').on("click", function() {
                addStoryToReadingList(storyId, pePC.populateStoryList);
            });

            // Set the play story onclick.
            $('#startStoryMessageButton').on("click", function() {
                if (pePM.findStoryByID(storyId) == -1) {
                    addStoryToReadingList(storyId, listHelper(storyId, pePC.showStoryOverview));
                }
                else {
                    pePC.showStoryOverview(storyId);
                }
            });
        }

        function addStoryToReadingList(storyId, next) {
            var user = pePC.getAuthorData();
            if ($.inArray(storyId, user.readingList) == -1) { 
                user.readingList.push(storyId);
                console.log("cannotViewComment: " + user);
                pePS.updateAuthor(user);
                if (pePM.findStoryByID(storyId) == -1) {
                    pePS.getStory(storyId, next);
                }
            }
        }

        /***********************************************************************************************/
        /*                               Functions for event messages                                  */
        /***********************************************************************************************/ 

        /*
         * @public 
         * @desc Requests the user's friends from the server and tells it to populate the friends popup after.
         * @returns {undefined}
         */
        pePlayerSocial.showChooseFriendsPopup = function() {
            mhLog.log(mhLog.LEVEL.DEBUG, "retrieving friends for popup");
            pePC.startSpinner();
            pePS.getUserFacebookFriends(pePC.getAuthorData().facebook.friends, populateFriendsPopup);
        }

        /*
         * @public 
         * @desc Hides the elements used to create a new message.
         * @returns {undefined}
         */
        pePlayerSocial.hideNewMessageArea = function() {
            $("#newMessageContainer").toggleClass("hide");
            $("#newMessageButton").toggleClass("hide");
            $("#messageContainer").toggleClass("hide");

        }

        /*
         * @public 
         * @desc Sends a message using the textarea in the "newMessageContainer" triggered by a button click.
         * @returns {undefined}
         */
        pePlayerSocial.sendMessageFromButton = function() {
            mhLog.log(mhLog.LEVEL.DEBUG, "Sending message to " + selectedFriend._id);

            sendMessage($("#messageTextarea").val(), selectedFriend._id);
            $("#messageTextarea").val("");
            pePlayerSocial.hideNewMessageArea();

        }
        
        /*
         * @public 
         * @desc Refreshes the conversation listview.
         * @param {messages} messages - list of messages between current logged in user and other users.
         * @returns {undefined}
         */
        pePlayerSocial.refreshConversations = function(messages) {
            mhLog.log(mhLog.LEVEL.DEBUG, "Refreshing conversations with " + messages.length + " messages");
            
            var listview = $("#conversationsList").listview();
            listview.empty();

            var conversations = buildConversations(messages);
            var keys = Object.keys(conversations);

            for (var i = 0; i < keys.length; i++) {
                listview.append(createConversationListItem(keys[i], conversations[keys[i]]));
            }
            $("#conversationsList").listview("refresh");
        }

        /*
         * @private
         * @desc Saves the message to database.
         * @param {text} text - the message text to store.
         * @param {userId} userId - the id of the receiving user.
         * @returns {undefined}
         */
        function sendMessage(text, userId) {

            mhLog.log(mhLog.LEVEL.DEBUG, "Sending message to " + userId);

            var message = {};
            message.text = text;
            message.sender = pePC.getAuthorData()._id;
            message.receiver = userId;
            message.event = pePC.getCurrentEventID();
            message.chapter = pePC.getCurrentChapterID();
            message.story = pePC.getCurrentStoryID();

            pePS.sendMessage(message, pePS.getMessages, message.sender, message.event, pePlayerSocial.refreshConversations);

        }

        /*
         * @private 
         * @desc Sends a message using the textarea in the "conversationPopup"
         * @param {userId} userId - the id of the receiving user.
         * @returns {undefined}
         */
        function sendMessageFromConvo(userId) {
            mhLog.log(mhLog.LEVEL.DEBUG, "Sending message to " + userId);

            sendMessage($("#popupMessageTextArea").val(), userId);
            $("#popupMessageTextArea").val("");
            $("#conversationPopup").popup("close");
        }

        /*
         * @private
         * @desc Organizes the messages by receiver into a JSON map. 
         * @param {messages} messages - A list of Message JSON objects.
         * @return A JSON map containing the messages grouped as conversations using the receiver id.
         */
        function buildConversations(messages) {

            // {userId : [message, message]}
            var convos = {};

            for (var i = 0; i < messages.length; i++) {

                var userId = pePC.getAuthorData()._id == messages[i].sender._id ? messages[i].receiver._id : messages[i].sender._id;

                // Create a new convo array for the userId.
                if (convos[userId] == undefined) {
                    convos[userId] = [];
                }
                convos[userId].push(messages[i]);
            }
            return convos;
        }

        /*
         * @private 
         * @desc Populates the friends listview and opens the popup that contains it.
         * @returns {undefined}
         */
        function populateFriendsPopup(friends) {

            mhLog.log(mhLog.LEVEL.DEBUG, "populating friends popup");

            var list = $('#friendList').listview();
            list.empty();
            for (var i = 0; i < friends.length; i++) {
                var user = friends[i];

                mhLog.log(mhLog.LEVEL.DEBUG, "creating list item for user " + user.name);
                list.append(createFriendListItem(user));
            }
            $("#friendList").listview("refresh");
            $("#newMessageButton").toggleClass("hide"); // hides
            $("#chooseFriendPopup").popup("open");
        }

        /*
         * @private 
         * @desc Shows the elements used to create a new message and closes the friends popup.
         * @param {user} user - JSON user object that was selected to message.
         * @returns {undefined}
         */
        function displayNewMessageArea(user) {
            $("#messageTextAreaLabel").text("To: " + user.name);
            $("#chooseFriendPopup").popup("close");
            $("#newMessageContainer").toggleClass("hide"); // shows
            $("#messageContainer").toggleClass("hide"); // hides
            selectedFriend = user;
        }

        /*
         * @private
         * @desc Displays the popup that contains the conversation between two users.
         * @param {messages} messages - All messages of the conversation.
         * @returns {undefined}
         */
        function displayConversationPopup(messages) {
            mhLog.log(mhLog.LEVEL.DEBUG, "populating conversations popup");

            var user = pePC.getAuthorData()._id == messages[0].sender._id ? messages[0].receiver : messages[0].sender;
            $("#conversationTitle").text(user.name);

            var list = $('#messageList').listview();
            list.empty();
            for (var i = 0; i < messages.length; i++) {
                var message = messages[i];
                mhLog.log(mhLog.LEVEL.DEBUG, "creating list item for user " + message._id);
                list.append(createMessageListItem(message));
            }
            
            list.append(createNewMessageListItem(user._id));

            $("#messageList").listview("refresh");
            $("#conversationPopup").popup("open");

            $("#conversationPopup").toggleClass("hide");
            $("#conversationPopup").toggleClass("hide");

        }

        /*
         * @private 
         * @desc create a list item containing a textarea and send button to send message from within the conversation.
         * @param {userId} userId - JSON user object id.
         * @returns {li DOM element}
         */
        function createNewMessageListItem(userId) {

            var li2 = document.createElement("li");
            li2.setAttribute("id", "textareaContainer");
            li2.setAttribute("class", "ui-li");

            var a = createLinkDOM('#', null, null, null, null);

            var textarea = document.createElement("textarea");
            textarea.setAttribute("id", "popupMessageTextArea");
            textarea.setAttribute("class", "ui-btn-up-a comment");
            textarea.setAttribute("data-clear-btn", "true");
            textarea.setAttribute("placeholder", "Send a new message");
            a.appendChild(textarea);

            li2.appendChild(a);

            // add onclick handlers bound to _id...Need to break down into DOM operations to add custom onclick handler
            var a2 = createLinkDOM('#removeComment', 'delBtn', listHelper(userId, sendMessageFromConvo), 'Send',
                              [{"key":"data-position-to","value":"window"}, {"key":"data-rel", "value":"popup"},
                               {"key":"data-transition", "value":"slideup"}]);
            li2.appendChild(a2);
            li2.setAttribute('data-icon', 'mail');

            return li2;
        }

        /**
         * @private
         * @desc create a message list item
         * @param {user} user - JSON user object
         * @returns {li DOM element}
         */
        function createFriendListItem(user) {
            var li, img, a, name;

            li = document.createElement("li");
            img = document.createElement("img");
            name = document.createElement("p");

            img.onload = pePC.stopSpinner; // When image loads, stop spinner
            img.src = 'https://graph.facebook.com/' + user.facebook.id + '/picture?width=75&height=75';
            img.className = 'ui-li-thumb';
            
            name.innerHTML = user.name;

            a = createLinkDOM('#', null, listHelper(user, displayNewMessageArea), null,
                              [{"key":"data-role","value":"button"}, {"key":"data-rel", "value":"popup"},
                               {"key":"data-transition", "value":"slideup"}]);
            a.appendChild(img);
            a.appendChild(name);

            li.appendChild(a);
            li.setAttribute('data-theme', 'a');
            li.setAttribute('id', user._id);

            return li;
        }

        /*
         * @private 
         * @desc create a list item for a conversation. Contains the users photo and name.
         * @param {userId} userId - JSON user object id.
         * @param {messages} messages - A list of mesages to display when the conversation is clicked.
         * @returns {li DOM element}
         */
        function createConversationListItem(userId, messages) {
            var li, img, a, p_text;

            // Want the User object of the other user, not current logged in user.
            var user = userId == messages[0].sender._id ? messages[0].sender : messages[0].receiver;

            li = document.createElement("li");
            img = document.createElement("img");
            p_text = document.createElement("p");

            img.onload = pePC.stopSpinner; // When image loads, stop spinner
            img.src = 'https://graph.facebook.com/' + user.facebook.id + '/picture?width=75&height=75';
            img.className = 'ui-li-thumb';
                    
            p_text.innerHTML = user.name;
            p_text.className = 'ui-li-desc textwrap';

            a = createLinkDOM('#', null, listHelper(messages, displayConversationPopup), null,
                              [{"key":"data-role","value":"button"}, {"key":"data-rel", "value":"popup"},
                               {"key":"data-transition", "value":"slideup"}]);
            a.appendChild(img);
            a.appendChild(p_text);
            
            li.appendChild(a);
            li.setAttribute('data-theme', 'a');
            li.setAttribute('data-icon', "false");
            
            return li;
        }

        /*
         * @private 
         * @desc create a list item for a message. Contains the users photo, text, and timestamp.
         * @param {message} message - The message to display, a Message object.
         * @returns {li DOM element}
         */
        function createMessageListItem(message) {
            var li, img, p_text, p_date, cleanStr;

            li = document.createElement("li");
            img = document.createElement("img");
            p_text = document.createElement("p");
            p_date = document.createElement("p");

            img.onload = pePC.stopSpinner; // When image loads, stop spinner
            img.src = 'https://graph.facebook.com/' + message.sender.facebook.id + '/picture?width=75&height=75';
            img.className = 'ui-li-thumb';
            
            cleanStr = message.text;
            cleanStr = cleanStr.replace(/\s+/gm," "); // Removes excessive new lines and whitespace
            cleanStr = cleanStr.replace(/<.+?>/gm, "");  // Removes html tags
            p_text.innerHTML = cleanStr;
            //p_text.className = 'ui-li-desc textwrap';

            var date = new Date(message.created);
            p_date.innerHTML = date.toLocaleString();
            p_date.className = 'ui-li-aside';

            li.appendChild(img);
            li.appendChild(p_text);
            li.appendChild(p_date);
            li.setAttribute('data-theme', 'a');
            li.setAttribute('data-icon', "false");
            li.setAttribute('id', message._id);
            
            return li;
        }


        /***********************************************************************************************/
        /*                               Functions for chapter comments                                */
        /***********************************************************************************************/ 

        /*
         * @public
         * @desc Populates the comment list view.
         * @param {array} comments - A list of JSON comment objects to display.
         * @returns {undefined}
         */
        pePlayerSocial.populateChapterComments = function(comments) {
            var list, comment, canDelete, li;

            mhLog.log(mhLog.LEVEL.DEBUG, "Populating chapter comments");

            list = $("#commentList").listview();
            list.empty();

            for (var i = 0; i < comments.length; i++) {
                comment = comments[i];
                
                // If the comment was made by the current auther, they can delete it.
                canDelete = (comment.user._id === pePC.getAuthorData()._id) ? true : false;

                li = createCommentListItem(comment, comment.user.facebook.id, canDelete);

                list.append(li);
            }
            // Add the text area for users to type a new comment.
            list.append('<li id="textareaContainer" class="ui-li"><textarea id="commentTextarea" class="ui-btn-up-a comment" \n\
                data-clear-btn="true" placeholder="Send a new message."></textarea></li>');


            
            $('#commentList').listview("refresh");
            
            $('.ui-icon-delete').click(function() {
                pePS.submitDeleteComment(this.id);
            });
        }

        /*
         * @public
         * @desc This saves the user's story comment into the database. 
         * @returns {undefined}
         */
         pePlayerSocial.publishChapterComment = function() {
            mhLog.log(mhLog.LEVEL.DEBUG, "saving chapter comment");
            pePC.startSpinner();
            var comment = {};
            comment.chapter = pePC.getCurrentChapterID();
            comment.user = pePC.getAuthorData()._id;
            comment.text = $("#commentTextarea").val();
            mhLog.log(mhLog.LEVEL.DEBUG, "new comment: " + comment);

            pePS.saveComment(comment, addCommentToList);
         }

        /*
         * @public
         * @desc Toggles the visibility of the chapter's comment discussion area.
         * @returns {undefined}
         */
        pePlayerSocial.changeCommentDisplay = function() {
            $('#spoilerAlert').toggleClass('hide');
            $('#sendCommentButton').toggleClass('hide');
            $('#commentList').toggleClass('hide');
        }

        /**
         * @private
         * @desc Adds the new comment (made by the current user) to the listview.
         * @param {comment} comment - JSON comment object
         * @returns {undefined}
         */
        function addCommentToList(comment) {
            mhLog.log(mhLog.LEVEL.DEBUG, "Adding new comment to list");
            
            pePC.startSpinner();

            var li = createCommentListItem(comment, pePC.getAuthorData().facebook.id, true);
            
            // Add the new comment to the end of the comment list, before the text area.
            $("#textareaContainer").before(li);
            
            $("#commentList").listview("refresh");
            
            // Clear the new comment area.
            $("#commentTextarea").val('');
        
            pePC.stopSpinner();
        }
        
        /**
         * @private
         * @desc create a comment list item
         * @param {comment} comment - JSON comment object
         * @param facebookId - The facebook id of the comment's author.
         * @param canDelete - True if the comment can be deleted by the current user; false otherwise.
         * @returns {li DOM element}
         */
        function createCommentListItem(comment, facebookId, canDelete) {
            var li, img, a, p_text, p_date, cleanStr;

            li = document.createElement("li");
            img = document.createElement("img");
            p_text = document.createElement("p");
            p_date = document.createElement("p");

            img.onload = pePC.stopSpinner; // When image loads, stop spinner
            img.src = 'https://graph.facebook.com/' + facebookId + '/picture?width=75&height=75';
            img.className = 'ui-li-thumb';
            
            cleanStr = comment.text;
            cleanStr = cleanStr.replace(/\s+/gm," "); // Removes excessive new lines and whitespace
            cleanStr = cleanStr.replace(/<.+?>/gm, "");  // Removes html tags
            p_text.innerHTML = cleanStr;
            p_text.className = 'ui-li-desc textwrap';

            p_date.innerHTML = comment.created;
            p_date.className = 'ui-li-aside';

            a = createLinkDOM('#', null, null, null, null);
            a.appendChild(img);
            a.appendChild(p_text);
            a.appendChild(p_date);

            li.appendChild(a);
            li.setAttribute('data-theme', 'a');
            li.setAttribute('data-icon', "false");
            li.setAttribute('id', comment._id);
            
            // Add the second a-element to create the split-icon list item. 
            if (canDelete) {

                // add onclick handlers bound to _id...Need to break down into DOM operations to add custom onclick handler
                var a2 = createLinkDOM('#removeComment', 'delBtn', 
                                       listHelper(comment._id, showDeleteCommentPopup), 'Delete',
                                       [{"key":"data-rel","value":"popup"}, {"key":"data-position-to", "value":"window"},
                                        {"key":"data-transition", "value":"pop"}]);
                li.appendChild(a2);
                li.setAttribute('data-icon', 'delete');
            }

            return li;
        }

        /**
         * @private
         * @desc Displays the popup used to delete a comment.
         * @param {type} id - Id of the comment to delete.
         * @returns {undefined}
         */
        function showDeleteCommentPopup(id) {
            var removeBtn;
            mhLog.log(mhLog.LEVEL.DEBUG, "showDeleteCommentPopup: id = " + id);

            removeBtn = document.getElementById("removeCommentButton");
            removeBtn.onclick = removeCommentFromList.bind(this, id);
        }

        /**
         * @private
         * @desc Removes the comment from the comment list.
         * @param {type} id - Id of the comment to delete.
         * @returns {undefined}
         */
        function removeCommentFromList(id) {
            mhLog.log(mhLog.LEVEL.DEBUG, "removeCommentFromList: comment id = " + id);

            pePS.submitDeleteComment(id);
            $('#'+id).remove();
        }

        /***********************************************************************************************/
        /*                               Functions for creating DOM elements                           */
        /***********************************************************************************************/ 

        function createLinkDOM(href, className, onClickMethod, innerHTML, attributes) {

            var a = document.createElement("a");
            if (href != null) {
                a.href = href;
            }
            if (className != null) {
                a.className = className;
            }
            if (onClickMethod != null) {
                a.onclick = onClickMethod;
            }
            if (innerHTML != null) {
                a.innerHTML = innerHTML;
            }
            if (attributes != null) {
                for (var i = 0; i < attributes.length; i++) {
                    var key = attributes[i].key;
                    var value = attributes[i].value;
                    a.setAttribute(key, value);
                }
            }
            return a;
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

        // Export to other modules
        return pePlayerSocial;
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