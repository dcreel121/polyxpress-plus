/**
 * PolyXpress Restful Web API routes for testing generic CRUD operations
 *
 * author: Michael Haungs
 *
 */

module.exports = function (app, models) {

    /**
     * notAuthorized: Checks to see if user is authorized and logged in.
     * @param {} req contains request information
     * @param {} res contains response information
     * @returns {Boolean}
     */
    function notAuthorized(req, res) {
        return (app.requireAuth === true && req.isAuthenticated() === false);
    }

    /*
     ************ User API routes *************
     */

    // User Collection: Get all users
    app.get('/peAPI/user', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.UserModel.find(function (err, users) {
            if (!err) {
                return res.send(users);
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
    });

    // User Collection: Create a user
    app.post('/peAPI/user', function (req, res) {
        var user;
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        user = new models.UserModel({
                                        facebook: {id: req.body.facebook.id, email: req.body.facebook.email, username: req.body.facebook.username},
                                        name    : req.body.name,
                                        username: req.body.username,
                                        email   : req.body.email
                                        // authorList, readingList default to []
                                    });
        user.save(function (err) {
            if (!err) {
                return app.mhLog.log(app.mhLog.LEVEL.DEBUG, "User FBID:" + user.id + " created");
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
        return res.send(user);
    });

    // User Collection: Get a single user
    app.get('/peAPI/user/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.UserModel.findById(req.params.id, function (err, user) {
            if (!err) {
                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "User " + user._id + " found");
                return res.send(user);
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
    });

    // User Collection:  Update a single user
    app.put('/peAPI/user/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.UserModel.findById(req.params.id, function (err, user) {
            if (!err) {
                user.id = req.body.id;
                user.name = req.body.name;
                user.username = req.body.username;
                user.email = req.body.email;
                user.authorList = req.body.authorList;
                user.readingList = req.body.readingList;
                user.storyCompletedList = req.body.storyCompletedList;
                user.chapterCompletedList = req.body.chapterCompletedList;
                user.eventCompletedList = req.body.eventCompletedList;
                user.modified = new Date();

                return user.save(function (err) {
                    if (!err) {
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "User " + user._id + " updated");
                    }
                    else {
                        sendAndDisplayError(res, err);
                    }
                    return res.send(user);
                });
            }
            else {
                sendAndDisplayError(res, err);

            }
        });
    });

    // User: Delete a single user
    app.delete('/peAPI/user/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.UserModel.findById(req.params.id, function (err, user) {
            if (!err) {
                return user.remove(function (err) {
                    var retVal = {};
                    if (!err) {
                        retVal._id = user._id;
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "User " + user._id + " removed");
                        // TODO:  Should delete all stories, chapters, and events belonging to user.
                        /* Just loop on authorList and purge */
                        return res.send(retVal);
                    }
                    else {
                        sendAndDisplayError(res, err);
                    }
                });
            }
            else {
                sendAndDisplayError(res, err);

            }
        });
    });

    /*
     ************ Story API routes *************
     */
    // Story Collection: Get all stories
    app.get('/peAPI/story', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.StoryModel.find(function (err, stories) {
            if (!err) {
                return res.send(stories);
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
    });

    // Story Collection: Create a story
    app.post('/peAPI/story', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }

        var story;
        story = new models.StoryModel({
                                          title      : req.body.title,
                                          authors    : req.body.authors,
                                          publish    : req.body.publish,
                                          test       : req.body.test,
                                          keywords   : req.body.keywords,
                                          overview   : req.body.overview,
                                          image      : req.body.image,
                                          proximity  : req.body.proximity,
                                          chapterList: req.body.chapterList

                                      });

        story.save(function (err) {
            if (!err) {
                // TODO:  Add story to "authorList" to all authors listed in req.body.authors
                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Story " + story.title + " created " + story._id);
                story.authors.forEach(addStoryToAuthorList.bind(this, story._id));
                return;
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
        return res.send(story);
    });

    function addStoryToAuthorList(storyID, author) {
        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Adding story " + storyID + " to " + author);
        return models.UserModel.findById(author, function (err, user) {
            if (!err) {
                if( user != null ) {
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "user = " + JSON.stringify(user));
                    user.authorList = user.authorList.map(function (e) {
                        return e.toString();
                    });
                    user.authorList.push(storyID);
                    user.modified = new Date();

                    return user.save(function (err) {
                        if (!err) {
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "User " + user._id + " updated");
                        } else {
                            app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
                        }
                        return err;
                    });
                } else {
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "In addStoryToAuthorList(routesCrud.js): Invalid author");
                }
            }
            else {
                return err;
            }
        });
    }

    // Story Collection: Get a single story
    app.get('/peAPI/story/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.StoryModel.findById(req.params.id, function (err, story) {
            console.log("Error: " + err);
            console.log("Story: " + story);
            if (!err) {
                if (story) {  // FIXME:  Should I make this check for accesses to Stories, chapters, and events?
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Story " + story._id + " found");
                    // FIXME:  change "true" to be check for requesting user is the author of this story?
                    if (story.publish || (story.test && true)) {
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Story " + story._id + " published");
                        return res.send(story);
                    } else {
                        return res.send(404, {error: "Story not published!"});
                    }
                }
                else {
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Story(" + req.params.id + ") not found!");
                    return res.send(404, {error: "Story not found!"});
                }
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
    });

    // Story Collection:  Update a single story
    app.put('/peAPI/story/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.StoryModel.findById(req.params.id, function (err, story) {
            var originalAuthors = story.authors;
            if (!err) {
                story.title = req.body.title;
                story.authors = req.body.authors;
                story.publish = req.body.publish;
                story.test = req.body.test;
                story.keywords = req.body.keywords;
                story.overview = req.body.overview;
                story.image = req.body.image;
                story.chapterList = req.body.chapterList;
                story.modified = new Date();

                return story.save(function (err) {
                    if (!err) {
                        // Remove story from all authors in oringal version of story
                        // NOTE: Could be more efficent and remove the diff, but overly
                        // complicated...so not doing it.
                        originalAuthors.forEach(removeStoryFromAuthorList.bind(this, story._id));
                        // TODO:  add story authorList of all authors listed in story.authors
                        story.authors.forEach(addStoryToAuthorList.bind(this, story._id));
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Story " + story._id + " updated");
                    }
                    else {
                        sendAndDisplayError(res, err);
                    }
                    return res.send(story);
                });
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
    });

    // remove a story from an author's authorList
    function removeStoryFromAuthorList(storyID, author) {
        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Removing story " + storyID + " from " + author);
        return models.UserModel.findById(author, function (err, user) {
            if (!err) {
                user.authorList = user.authorList.map(function (e) {
                    return e.toString();
                });
                user.authorList.splice(user.authorList.indexOf(storyID), 1);
                user.modified = new Date();

                return user.save(function (err) {
                    if (!err) {
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "User " + user._id + " updated");
                    } else {
                        app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
                    }
                    return err;
                });
            }
            else {
                return err;
            }
        });
    }

    // Story Collection: Delete a single story
    app.delete('/peAPI/story/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.StoryModel.findById(req.params.id, function (err, story) {
            if (!err) {
                return story.remove(function (err) {
                    var retVal = {};
                    if (!err) {
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Story " + story._id + " removed");

                        // Purge this story from all users' authored, completed, and reading lists
                        purgeStoryFromDB(res, story._id);

                        // only sending object with _id field instead of entire story
                        retVal._id = story._id;
                        return res.send(retVal);
                    }
                    else {
                        sendAndDisplayError(res, err);
                    }
                });
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
    });

    // Purge this story from all users' authored, completed, and reading lists
    function purgeStoryFromDB(res, id) {
        purgeStoryFromAuthorList(res, id);
        purgeStoryFromReadingList(res, id);
    }

    // Purge this story from all users' author lists
    function purgeStoryFromAuthorList(res, id) {
        return models.UserModel.update({}, {$pull: {authorList: id}}, {multi: true, upsert: false}, function (err, numberUpdated) {
            if (err) {
                return sendAndDisplayError(res, err);
            }

            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "purgeStoryFromAuthorList(" + id + "): " + numberUpdated + " updated");

        });
    }

    // Purge this story from all users' reading lists
    function purgeStoryFromReadingList(res, id) {
        return models.UserModel.update({}, {$pull: {readingList: id}}, {multi: true, upsert: false}, function (err, numberUpdated) {
            if (err) {
                return sendAndDisplayError(res, err);
            }

            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "purgeStoryFromReadingList(" + id + "): " + numberUpdated + " updated");

        });
    }

    /*
     ************ Chapter API routes *************
     */

    // Chapter Collection: Get all chapters
    app.get('/peAPI/chapter', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.ChapterModel.find(function (err, chapters) {
            if (!err) {
                return res.send(chapters);
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
    });

    // Chapter Collection: Create a chapter
    app.post('/peAPI/chapter', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }

        var chapter;
        chapter = new models.ChapterModel({
                                              title    : req.body.title,
                                              teaser   : req.body.teaser,
                                              authors  : req.body.authors,
                                              keywords : req.body.keywords,
                                              overview : req.body.overview,
                                              image    : req.body.image,
                                              proximity: req.body.proximity,
                                              eventList: req.body.eventList
                                          });
        chapter.save(function (err) {
            if (!err) {
                return app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Chapter " + chapter.title + " created");
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
        return res.send(chapter);
    });

    // Chapter Collection: Get a single chapter
    app.get('/peAPI/chapter/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.ChapterModel.findById(req.params.id, function (err, chapter) {
            if (!err) {
                if (chapter) {
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Chapter " + chapter._id + " found");
                    // check session data to see if user completed this chapter
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Session " + req.session.completedChapters);
                    if (req.session.completedChapters) {
                        if (req.session.completedChapters.indexOf(String(chapter._id)) > 0) {
                            // NOTE:  the field "completed" is needed by Player.  There's
                            // a non-obvious dependency here!
                            chapter = chapter.toObject();
                            chapter.completed = true;
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Marking chapter " + chapter._id
                                + " completed");
                        }
                    }
                }
                return res.send(chapter);
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
    });

    // Story Chapter:  Update a single chapter
    app.put('/peAPI/chapter/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.ChapterModel.findById(req.params.id, function (err, chapter) {
            if (!err) {
                chapter.title = req.body.title;
                chapter.teaser = req.body.teaser;
                chapter.authors = req.body.authors;
                chapter.keywords = req.body.keywords;
                chapter.overview = req.body.overview;
                chapter.image = req.body.image;
                chapter.proximity = req.body.proximity;
                chapter.eventList = req.body.eventList;
                chapter.modified = new Date();

                return chapter.save(function (err) {
                    if (!err) {
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Chapter " + chapter._id + " updated");
                    }
                    else {
                        sendAndDisplayError(res, err);
                    }
                    return res.send(chapter);
                });
            }
            else {
                sendAndDisplayError(res, err);
            }

        });
    });

    // Story Chapter: Delete a single chapter
    app.delete('/peAPI/chapter/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.ChapterModel.findById(req.params.id, function (err, chapter) {
            var retVal = {};
            if (!err) {
                return chapter.remove(function (err) {
                    if (!err) {
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Chapter " + chapter._id + " removed");
                        // Check if any stories are unpublishable now after chapter removal
                        purgeChapterFromStories(res, chapter._id);

                        // only sending object with _id field instead of entire story
                        retVal._id = chapter._id;
                        return res.send(retVal);  // TODO: Make this a list of stories that are not unpublished
                    }
                    else {
                        sendAndDisplayError(res, err);
                    }
                });
            }
            else {
                sendAndDisplayError(res, err);
            }

        });
    });

    // Purge this chapter from all stories
    function purgeChapterFromStories(res, id) {

        /*models.StoryModel.find({"chapterList": id}, function(err, stories) {
         app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Number of story matches: " + stories.length);
         if (stories.length > 0) {
         app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Story: " + JSON.stringify(stories[0]));
         for (i = 0, n = stories.length; i < n; i++) {
         stories[i].chapterList.pull(id);
         if (stories[i].chapterList.length === 0) {
         stories[i].publish = false;
         }
         stories[i].save(function(err) {
         if (!err) {
         app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Story updated");
         }
         else {
         app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Story NOT updated");
         }
         });
         }
         }
         });*/

        return models.StoryModel.update({}, {$pull: {chapterList: id}}, {multi: true, upsert: false}, function (err, numberUpdated) {
            if (err) {
                return sendAndDisplayError(res, err);
            }

            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "purgeChapterFromStories(" + id + "): " + numberUpdated + " updated");

        });
    }

    /*
     ************ Event API routes *************
     */

    // Event Collection: Get all events
    app.get('/peAPI/event', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.EventModel.find(function (err, events) {
            if (!err) {
                return res.send(events);
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
    });

    // Event Collection: Create an event
    app.post('/peAPI/event', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }

        var event;
        event = new models.EventModel({
                                          title    : req.body.title,
                                          teaser   : req.body.teaser,
                                          authors  : req.body.authors,
                                          keywords : req.body.keywords,
                                          proximity: req.body.proximity,
                                          assetList: req.body.assetList
                                      });
        event.save(function (err) {
            if (!err) {
                return app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Event " + event.title + " created");
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
        return res.send(event);
    });

    // Event Collection: Get a single event
    app.get('/peAPI/event/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.EventModel.findById(req.params.id, function (err, event) {
            if (!err) {
                if (event) {
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Event " + event._id + " found");
                    // check session data to see if user completed this event
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Session " + req.session.completedEvents);
                    if (req.session.completedEvents) {
                        if (req.session.completedEvents.indexOf(String(event._id)) > 0) {
                            // NOTE:  the field "completed" is needed by Player.  There's
                            // a non-obvious dependency here!
                            event = event.toObject();
                            event.completed = true;
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Marking event " + event._id
                                + " completed");
                        }
                    }
                }
                return res.send(event);
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
    });

    // Event Collection:  Update a single event
    app.put('/peAPI/event/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.EventModel.findById(req.params.id, function (err, event) {
            if (!err) {
                event.title = req.body.title;
                event.teaser = req.body.teaser;
                event.authors = req.body.authors;
                event.keywords = req.body.keywords;
                event.proximity = req.body.proximity;
                event.assetList = req.body.assetList;
                event.modified = new Date();

                return event.save(function (err) {
                    if (!err) {
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Event " + event._id + " updated");
                    }
                    else {
                        sendAndDisplayError(res, err);
                    }
                    return res.send(event);
                });
            }
            else {
                sendAndDisplayError(res, err);
            }

        });
    });

    // Event Collection: Delete a single event
    app.delete('/peAPI/event/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.EventModel.findById(req.params.id, function (err, event) {
            if (!err) {
                return event.remove(function (err) {
                    var retVal = {};
                    if (!err) {
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Event " + event._id + " removed");

                        // Check if any stories are unpublishable now after chapter removal
                        purgeEventFromChapters(res, event._id);

                        retVal._id = event._id;
                        return res.send(retVal);
                    }
                    else {
                        sendAndDisplayError(res, err);
                    }
                });
            }
            else {
                sendAndDisplayError(res, err);
            }
        });
    });

    // Purge this event from all chapters
    function purgeEventFromChapters(res, id) {
        return models.ChapterModel.update({}, {$pull: {eventList: id}}, {multi: true, upsert: false}, function (err, numberUpdated) {
            if (err) {
                return sendAndDisplayError(res, err);
            }

            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "purgeEventFromChapters(" + id + "): " + numberUpdated + " updated");

        });
    }

    /*
     ************ Utility functions *************
     */

    function sendAndDisplayError(res, err) {
        app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
        res.statusCode = 400;
        return res.send(err.toString());
    }

};
