/**
 * PolyXpress Restful Web API routes for PolyXpress Player social functions.
 *
 * author: Desiree Creel
 *
 */

module.exports = function (app, models) {

    // Feed Collection: Create a feed
    app.post('/peAPI/feed', function (req, res) {
        
        // Test if the Feed already exists
        return models.FeedModel.find( {story: req.body.story, user: req.body.user}, {}, {limit:1}, function (err, data) {
            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "feed found: " + JSON.stringify(data));
            
            var feed = data[0];

            // Create Feed if one was not found
            if (!err && data.length === 0) {
                feed = new models.FeedModel({
                    user      : req.body.user,
                    story     : req.body.story,
                    action    : req.body.action,
                    city      : req.body.city,
                    location  : req.body.location,
                    proximity : req.body.proximity,
                    facebookId: req.body.facebookId
                });
            }

            // Update the currently existing Feed
            else {
                feed.action = req.body.action;
            }
            
            // Save the Feed
            feed.save(function (err) {
                if (!err) {
                    return app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Feed user:" + feed.user + " & story: " + feed.story + " created");
                }
                else {
                    return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
                }
            });
            return res.send(feed);
        });

    });

    // Feed Collection: Get all feeds of friends that user is following
    app.get('/peAPI/feed/friends/:id', function(req, res) {

        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Finding feeds wtih user " + req.params.id);
        
        // Find the user with the given facebook id.
        return models.UserModel.findOne({'facebook.id': req.params.id}, function(err, user) {
            if (!err) {
                // If facebook id is in the found user's facebook friends return the feed. 
                return models.FeedModel.find({facebookId: {$in: user.facebook.friends}}).limit(50)
                    .populate('story user').exec(function (err, feeds) {
                    if (!err) {
                        //app.mhLog.log(app.mhLog.LEVEL.DEBUG, "RESULTS*******************: " + JSON.stringify(feeds));
                        return res.send(feeds);
                    }
                    else {
                        return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
                    }
                });
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });  
    });

    //peAPI/feed/nearby/:lng/:lat
    app.get('/peAPI/feed/nearby/:lng/:lat', function(req, res) {

        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Finding feeds wtih coords " + req.params.lng + ", " + req.params.lat);
        var coords = [];
        coords[0] = req.params.lng;
        coords[1] = req.params.lat;

        // Return feeds located near the lng and lat passed in. 
        return models.FeedModel.find({location: { $near: coords, $maxDistance: 32} }).limit(50)
            .populate('story user').exec(function (err, feeds) {
            if (!err) {
                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "RESULTS*******************: " + JSON.stringify(feeds));
                return res.send(feeds);
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        }); 
    });


    // Comment Collection: Get all comments about a chapter.
    app.get('/peAPI/comments/chapter/:id', function(req, res) {
        
        return models.CommentModel.find({'chapter': req.params.id}).populate('user chapter').exec(function (err, comments) {
            if (!err) {
                return res.send(comments);
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });
    });

    // Comment Collection: Create a comment
    app.post('/peAPI/comments', function(req, res) {
        
        var comment = new models.CommentModel({
            text: req.body.text,
            user: req.body.user,
            chapter: req.body.chapter,
            created: new Date()
        });
        comment.save(function(err) {
            if (!err) {
                return app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Comment " + comment._id + " for chapter " + comment.chapter._id + " created.");
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });
        return res.send(comment);
    }); 

    // Comment: Delete a single comment
    app.delete('/peAPI/comments/:id', function(req, res) {
        
        return models.CommentModel.findById(req.params.id, function(err, comment) {
            if (!err) {
                return comment.remove(function(err) {
                    var retVal = {};
                    if (!err) {
                        retVal._id = comment._id;
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Comment " + comment._id + " removed");
                        return res.send(retVal);
                    }
                    else {
                        return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
                    }
                });
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });
    });
    
    // User: Returns the user objects for the given list of Facebook ids.
    app.get('/peAPI/user/facebook/friends/:ids', function(req, res) {
        
        var fb_ids = req.params.ids.split(',');

        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "recieved these fb ids as params: " + fb_ids);

        return models.UserModel.find({'facebook.id': {$in: fb_ids}}, function (err, friends) {
            if (!err) {

                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "found " + friends.length + " for " + fb_ids.length + " ids.");

                return res.send(friends);
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        }).limit(50);
            
    });

    // Message Collection: Returns all messages that involve the given user and event.
    app.get('/peAPI/message/conversations/:ids', function(req, res) {

        var ids = req.params.ids.split(',');
        var userId = ids[0];
        var eventId = ids[1];

        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "recieved these ids as params: " + ids);

        return models.MessageModel.find( {$and : [ {$or : [{'sender': userId}, {'receiver': userId}]}, {'event':eventId}]} )
                .populate('receiver sender').exec(function (err, messages) {
            if (!err) {

                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "found " + messages.length + " messages.");

                return res.send(messages);
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });

    });

    // Message Collection: Create a message
    app.post('/peAPI/message', function(req, res) {
        
        var message = new models.MessageModel({
            text: req.body.text,
            sender: req.body.sender,
            receiver: req.body.receiver,
            event: req.body.event,
            chapter: req.body.chapter,
            story: req.body.story,
            seen: false,
            created: new Date()
        });
        message.save(function(err) {
            if (!err) {
                return app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Message " + message._id + " for event " + message.event + " created.");
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });
        return res.send(message);
    }); 

    // Message Collection: Get all unread mesasges for user.
    app.get('/peAPI/message/for/:id', function (req, res) {

        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "getting unread messages for user " + req.params.id);
        
        return models.MessageModel.find( {$and: [{"receiver" : req.params.id}, {"seen" : "false" }]})
                .populate('sender event story').exec(function (err, messages) {
            if (!err) {
                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "found " + messages.length + " messages.");

                return res.send(messages);
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });
 
    });

    // Message Collection:  Update a single message as seen.
    app.put('/peAPI/message/seen/:id', function (req, res) {

        return models.MessageModel.findById(req.params.id, function (err, message) {
            if (!err) {
                message.seen = true;
                return message.save(function (err) {
                    if (!err) {
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Message " + message._id + " updated as seen");
                    }
                    else {
                        sendAndDisplayError(res, err);
                    }
                    return res.send(message);
                });
            }
            else {
                sendAndDisplayError(res, err);

            }
        });
    });


};














