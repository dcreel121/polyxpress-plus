/**
 * PolyXpress Restful Web API routes for PolyXpress Player (test)
 *
 * Description:
 *
 * Copyright:
 * License:
 *
 * Initial Author: Michael Haungs
 */

module.exports = function (app, models) {
    var os = require('os');

    /*
     ************ Authorization Middleware/Utility *************
     */

    /**
     * notAuthorizedMW: Checks to see if user is authorized and logged in.  This is meant to
     * be used as Express middleware.
     * @param {} req contains request information
     * @param {} res contains response information
     * @param {} next contains next function to run if middleware completes successfully.
     * @returns null
     */
    function notAuthorizedMW(req, res, next) {
        // requireAuth set by PolyXpress, isAuthenticated implemented in Passportjs
        if (app.requireAuth === true && req.isAuthenticated()) {
            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "notAuthorizedMW before next().");
            next();
        } else {
            // or, could redirect to a static error message page
            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "notAuthorizedMW before redirect.");
            res.redirect("/");  // @todo Could redirect to an error page
        }
    }

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
     ************ Admin Routes *************
     */

    app.get('/admin', function (req, res, next) {
        res.redirect("/private/login.html");
    });

    app.get('/private/login.html', function (req, res, next) {
        req.url = req.url.replace(/^\/private/, '');
        app.restrictedStaticMiddleware(req, res, next);
    });

    app.get('/private/:file', function (req, res, next) {
        // @todo  Only allowing mhaungs as admin
        var adminID;
        if (req.session && req.session.passport) {
            adminID = req.session.passport.user;
        }
        req.url = req.url.replace(/^\/private/, '');
        if (req.params && (req.params.file = "admin.html") && (adminID === "543af2a5f1625ac91855ada9")) {
            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Admin approved.");
            app.restrictedStaticMiddleware(req, res, next);
        } else {
            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Admin denied.");
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
    });

    /*
     ************ System routes *************
     */

    // Web server status
    app.get('/status', function (req, res) {
        if (notAuthorized(req, res)) {  // @todo if user had been authorized on any other page, then this will
            // let them through even though the are not the "admin" account...other admin pages may suffer the same.
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        res.send([
                     '<html><head><title>PolyXpress Status</title></head>',
                     '<body>',
                     '<h1>Server Information</h1>',
                     '<table border="1">',
                     '<tr><td>Host Name: </td><td>' + os.hostname() + '</td></tr>',
                     '<tr><td> OS Type:  </td><td>' + os.type() + ' ' + os.platform() + ' ' + os.arch() + ' ' + os.release() + '</td></tr>',
                     '<tr><td> Uptime:  </td><td>' + os.uptime() + '</td></tr>',
                     '</table>',
                     '</body>',
                     '</html>'].join('\n')
        );
        // add more metrics
    });

    /*
     ************ Testing Support routes *************
     */

    // @todo This does not check for admin priviliges...but at least
    // won't allow to be run while in the cloud
    app.get('/peAPI/testON', function (req, res) {
        if (!app.cloud.runningInCloud) {
            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Authentication off...");
            app.requireAuth = false;
            res.send("Success");
        }
    });

    app.get('/peAPI/testOFF', function (req, res) {
        if (!app.cloud.runningInCloud) {
            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Authentication on...");
            app.requireAuth = true;
            res.send("Success");
        }
    });

    /*
     ************ User API routes *************
     */

    // User Collection: Determine if user already logged in
    app.get('/peAPI/user/checkAuth', function (req, res) {
        if (notAuthorized(req, res)) {
            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Inside /peAPI/user/checkAuth...sending loggedIn = False.")
            return res.send({loggedIn: false});
        }
        else {
            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Inside /peAPI/user/checkAuth...sending loggedIn = True.")
            return res.send({loggedIn: true});
        }
    });

    // User Collection: Get logged in user info (need lists)
    app.get('/peAPI/user/self', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }

        return models.UserModel.findOne({_id: req.user._id}, function (err, user) {
            if (!err) {
                return res.send(user);
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });
    });

    // User Collection: Get all authors that match an author's name
    app.get('/peAPI/author/search/:keyword', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        // @todo should return a list of users that match the name instead of just one
        var re = new RegExp(req.params.keyword, 'i');
        return models.UserModel.findOne({name: {$regex: re}}, function (err, user) {
            if (!err) {
                return res.send(user);
            } else {
                res.statusCode = 404; // HTTP Not found error
                app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
                return res.send("Error:  Not Found.");
            }
        });
    });

    /*
     ************ Story API routes *************
     */

    // Story Collection: Get all stories with given author _id
    app.get('/peAPI/story/id/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "author = " + req.params.id);
        return models.StoryModel.find({authors: {$in: [req.params.id]}}, function (err, stories) {
            if (!err) {
                app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, "stories = " + stories);
                return res.send(stories);
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });
    });

    // Story Collection: Get all stories that match a keyword
    app.get('/peAPI/story/keyword/:keyword', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.StoryModel.find({
                                          publish : true,
                                          authors : {$nin: [req.user._id]},
                                          keywords: {$in: req.params.keyword.split(" ")}
                                      }, function (err, stories) {
            if (!err) {
                return res.send(stories);
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, "In /peAPI/story/keyword, inner err = " + err);
            }
        }).limit(50);
    });

    // Story Collection: Get all recent stories
    app.get('/peAPI/story/recent', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        var s = models.StoryModel.find({publish: true, authors: {$nin: [req.user._id]}}).sort({modified: -1}).limit(10);
        s.exec(function (err, stories) {
            if (!err) {
                return res.send(stories);
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });
    });

    // Chapter Collection: Get all chapters authored by the given id
    app.get('/peAPI/chapter/id/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.ChapterModel.find({authors: {$in: [req.params.id]}}, function (err, chapters) {
            if (!err) {
                return res.send(chapters);
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });
    });

    // Chapter Collection: Get all chapters that match a keyword
    app.get('/peAPI/chapter/keyword/:keyword', function (req, res) {
        var kw;
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        if (req.params.keyword) {
            kw = req.params.keyword.toLowerCase();
            return models.ChapterModel.find({keywords: kw}, function (err, chapters) {
                if (!err) {
                    return res.send(chapters);
                }
                else {
                    return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
                }
            });
        } else {
            return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
        }
    });

    // Event Collection: Get all events authored by the given id
    app.get('/peAPI/event/id/:id', function (req, res) {
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        return models.EventModel.find({authors: {$in: [req.params.id]}}, function (err, events) {
            if (!err) {
                return res.send(events);
            }
            else {
                return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
            }
        });
    });

    // Event Collection: Get all events that match a keyword
    app.get('/peAPI/event/keyword/:keyword', function (req, res) {
        var kw;
        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }
        if( req.params.keyword ) {
            kw = req.params.keyword.toLowerCase();
            return models.EventModel.find({keywords: kw}, function (err, events) {
                if (!err) {
                    return res.send(events);
                }
                else {
                    return app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, err);
                }
            });
        }
    });

    // Session Collection:  Mark chapter as complete in this user's session
    app.put('/peAPI/session/complete/chapter/:id', function (req, res) {
        var completedChaptersArray;

        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }

        if (!req.session.completedChapters) {
            req.session.completedChapters = JSON.stringify([].concat(req.params.id));
        } else {
            completedChaptersArray = JSON.parse(req.session.completedChapters);
            if (completedChaptersArray.indexOf(req.params.id) === -1) {
                completedChaptersArray.push(req.params.id);
                req.session.completedChapters = JSON.stringify(completedChaptersArray);
                app.mhLog.log(app.mhLog.LEVEL.DEVELOPMENT, "req.session.completedChapters = " + req.session.completedChapters);
            } else {
                app.mhLog.log(app.mhLog.LEVEL.DEVELOPMENT, "req.session.completedChapters = DUPLICATE");
            }
        }

        req.session.save(function (err) {
            if (err) {
                app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, "Error occured saving session");
            } else {
                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "User session updated.");
            }
        });

    });

    // Session Collection:  Mark event as complete in this user's session
    app.put('/peAPI/session/complete/event/:id', function (req, res) {
        var completedEventsArray;

        if (notAuthorized(req, res)) {
            res.statusCode = 401; // HTTP Unauthorized error
            return res.send("Unauthorized.");
        }

        if (!req.session.completedEvents) {
            req.session.completedEvents = JSON.stringify([].concat(req.params.id));
        } else {
            completedEventsArray = JSON.parse(req.session.completedEvents);
            if (completedEventsArray.indexOf(req.params.id) === -1) {
                completedEventsArray.push(req.params.id);
                req.session.completedEvents = JSON.stringify(completedEventsArray);
                app.mhLog.log(app.mhLog.LEVEL.DEVELOPMENT, "req.session.completedEvents = " + req.session.completedEvents);
            } else {
                app.mhLog.log(app.mhLog.LEVEL.DEVELOPMENT, "req.session.completedEvents = DUPLICATE");
            }
        }

        req.session.save(function (err) {
            if (err) {
                app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, "Error occured saving session");
            } else {
                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "User session updated.");
            }
        });

    });

}
;
