module.exports = function (app, models, cloudEnv) {

    var auths = require('./auth.js');

    var myEnv = {};

    /*
     ************ All *************
     */

    // session setup
    app.passport.serializeUser(function (user, done) {
        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Inside serialize: " + JSON.stringify(user));
        done(null, user._id);
    });

    app.passport.deserializeUser(function (id, done) {
        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Inside deserialize: " + id);
        models.UserModel.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // Parse environment variables to setup Facebook authentication
    if (app.cloud.runningInCloud) {
        // Configure Facebook Authentication Info
        if (cloudEnv.vcapApplication.space_name === 'development') {
            myEnv.fbAppId = auths.facebookAuthDev.clientID;
            myEnv.fbAppSecret = auths.facebookAuthDev.clientSecret;
            myEnv.callbackURL = auths.facebookAuthDev.callbackURL;

            myEnv.twAppId = auths.twitterAuthDev.clientID;
            myEnv.twAppSecret = auths.twitterAuthDev.clientSecret;
            myEnv.twCallbackURL = auths.twitterAuthDev.callbackURL;

            myEnv.gAppId = auths.googleAuthDev.clientID;
            myEnv.gAppSecret = auths.googleAuthDev.clientSecret;
            myEnv.gCallbackURL = auths.googleAuthDev.callbackURL;

        }
        else if (cloudEnv.vcapApplication.space_name === 'production') {
            myEnv.fbAppId = auths.facebookAuthProd.clientID;
            myEnv.fbAppSecret = auths.facebookAuthProd.clientSecret;
            myEnv.callbackURL = auths.facebookAuthProd.callbackURL;

            myEnv.twAppId = auths.twitterAuthProd.clientID;
            myEnv.twAppSecret = auths.twitterAuthProd.clientSecret;
            myEnv.twCallbackURL = auths.twitterAuthProd.callbackURL;

            myEnv.gAppId = auths.googleAuthProd.clientID;
            myEnv.gAppSecret = auths.googleAuthProd.clientSecret;
            myEnv.gCallbackURL = auths.googleAuthProd.callbackURL;

        }
        else if (cloudEnv.vcapApplication.space_name === 'staging') {
            // @todo Presently, do not use "staging" and new services are configured for it.
            myEnv.fbAppId = auths.facebookAuthStage.clientID;
            myEnv.fbAppSecret = auths.facebookAuthStage.clientSecret;
            myEnv.callbackURL = auths.facebookAuthStage.callbackURL;

            myEnv.twAppId = auths.twitterAuthStage.clientID;
            myEnv.twAppSecret = auths.twitterAuthStage.clientSecret;
            myEnv.twCallbackURL = auths.twitterAuthStage.callbackURL;

            myEnv.gAppId = auths.googleAuthStage.clientID;
            myEnv.gAppSecret = auths.googleAuthStage.clientSecret;
            myEnv.gCallbackURL = auths.googleAuthStage.callbackURL;

        }
    }
    else {
        // Configure Facebook Authentication Info (pxTest Facebook App)
        myEnv.fbAppId = auths.facebookAuthLocal.clientID;
        myEnv.fbAppSecret = auths.facebookAuthLocal.clientSecret;
        myEnv.callbackURL = auths.facebookAuthLocal.callbackURL;

        myEnv.twAppId = auths.twitterAuthLocal.clientID;
        myEnv.twAppSecret = auths.twitterAuthLocal.clientSecret;
        myEnv.twCallbackURL = auths.twitterAuthLocal.callbackURL;

        myEnv.gAppId = auths.googleAuthLocal.clientID;
        myEnv.gAppSecret = auths.googleAuthLocal.clientSecret;
        myEnv.gCallbackURL = auths.googleAuthLocal.callbackURL;

        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "fbAppId = " + myEnv.fbAppId);
        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "twAppId = " + myEnv.twAppId);
        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "gAppId = " + myEnv.gAppId);
    }

    /*
     ************ Facebook *************
     */

    var FacebookStrategy = require('passport-facebook').Strategy;

    app.passport.use(new FacebookStrategy(
        {
            clientID         : myEnv.fbAppId,
            clientSecret     : myEnv.fbAppSecret,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, refreshToken, profile, done) {

            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "In Passport code");
                    app.fb.setAccessToken(token);
                    console.log(token, refreshToken);
            // asynchronous
            process.nextTick(function () {

                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook User Data:  " + JSON.stringify(profile));

                // check if the user is already logged in
                if (!req.user) {
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook: User already not logged in");

                    models.UserModel.findOne({ 'facebook.id': profile.id }, function (err, user) 
                    {
                        if (err) {
                            return done(err);
                        }

                        if (user) {

                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook: found user..was there a token?");

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.facebook.token) {
                                user.facebook.token = token;
                                user.facebook.username = (profile.username || '');
                                user.facebook.friends = [];
                                user.name = profile.displayName;
                                if (profile.email) {
                                    user.facebook.email = (profile.emails[0].value || '').toLowerCase();
                                } else {
                                    user.facebook.email = '';
                                }

                                // Get extra Facebook info (friends list and profile picture)
                                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "About to make call for friends");
                                return app.fb.get('/' + profile.id + '/friends?fields=installed', function(err, res) 
                                {
                                    

                                    // Retrieve friends that have the app installed from the Facebook friend list.
                                    var installed = res.data.filter(function (friend) {return friend.installed; });
                                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Friends: " + JSON.stringify(installed));
                                
                                    // Save the Facebook ID of the installed friends to look up friends later.
                                    installed.map(function(friend) { user.facebook.friends.push(friend.id); });

                                    user.save(function (err) {
                                        if (err) {
                                            return done(err);
                                        }

                                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook: linked token.");

                                        return done(null, user);
                                    });
                                });
                            }

                            return done(null, user); // user found, return that user
                        } 
                        else {
                            // if there is no user, create them
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook: Creating new user!");
                            var newUser = new models.UserModel();

                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = token;
                            newUser.facebook.username = profile.username;
                            newUser.name = profile.displayName;

                            if (profile.email) {
                                newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
                            } else {
                                newUser.facebook.email = '';
                            }

                            // Get extra Facebook info (friends list and profile picture)
                            return app.fb.get('/' + profile.id + '/friends?fields=installed', function(err, res) 
                            {
                                // Retrieve friends that have the app installed from the Facebook friend list.
                                var installed = res.data.filter(function (friend) {return friend.installed; });
                                
                                // Save the Facebook ID of the installed friends to look up friends later.
                                installed.map(function(user) { newUser.facebook.friends.push(user.id); });

                                return app.fb.get('/' + profile.id + '/picture', function(err, res) 
                                {
                                    // Save the Facebook profile picture
                                    newUser.facebook.picture = res.location;

                                    newUser.save(function (err) {
                                        if (err) {
                                            return done(err);
                                        }

                                        return done(null, newUser);
                                    });
                                });
                            });
                        }
                    });
                } 
                else {
                    // user already exists and is logged in, we have to link accounts
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook: User already already logged in");
                    var user = req.user; // pull the user out of the session

                    user.facebook.id = profile.id;
                    user.facebook.token = token;
                    user.name = profile.displayName;

                    if (profile.email) {
                        user.facebook.email = (profile.emails[0].value || '').toLowerCase();
                    } else {
                        user.facebook.email = '';
                    }
                    // Get extra Facebook info (friends list and profile picture)
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "About to make call for friends 2");
                    return app.fb.get('/' + profile.id + '/friends?fields=installed', function(err, res) 
                    {
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Friends: " + JSON.stringify(res.data));

                        // Retrieve friends that have the app installed from the Facebook friend list.
                        var installed = res.data.filter(function (friend) {return friend.installed; });
                        
                        // Save the Facebook ID of the installed friends to look up friends later.
                        installed.map(function(friend) { user.facebook.friends.push(friend.id); });
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook updated user = " + JSON.stringify(user));

                        user.save(function (err) {
                            if (err) {
                                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook: existing user error: " + err);
                                return done(err);
                            }
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook: Saving any changed user info.");
                            return done(null, user);
                        });
                    });
                }
            });

        }));

    /*
     ************ Twitter *************
     */

    var TwitterStrategy = require('passport-twitter').Strategy;

    app.passport.use(new TwitterStrategy(
        {
            consumerKey      : myEnv.twAppId,
            consumerSecret   : myEnv.twAppSecret,
            //callbackURL      : myEnv.callbackURL,  // This is dynamically supplied
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, refreshToken, profile, done) {

            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "In Passport Twitter code");

            // asynchronous
            process.nextTick(function () {

                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Twitter User Data:  " + JSON.stringify(profile));

                // check if the user is already logged in
                if (!req.user) {
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Twitter: User already not logged in");

                    models.UserModel.findOne({ 'twitter.id': profile.id }, function (err, user) {
                        if (err) {
                            return done(err);
                        }

                        if (user) {

                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Twitter: found user..was there a token?");

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.twitter.token) {
                                user.twitter.token = token;
                                user.twitter.username = profile.username;
                                user.name = profile.displayName;

                                user.save(function (err) {
                                    if (err) {
                                        return done(err);
                                    }

                                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Twitter: linked token.");

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Twitter: Creating new user!");
                            var newUser = new models.UserModel();

                            newUser.twitter.id = profile.id;
                            newUser.twitter.token = token;
                            newUser.twitter.username = profile.username;
                            newUser.name = profile.displayName;

                            newUser.save(function (err) {
                                if (err) {
                                    return done(err);
                                }

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Twitter: User already already logged in");
                    var user = req.user; // pull the user out of the session

                    user.twitter.id = profile.id;
                    user.twitter.token = token;
                    user.twitter.username = profile.username;
                    user.name = profile.displayName;

                    user.save(function (err) {
                        if (err) {
                            return done(err);
                        }
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Twitter: Saving any changed user info.");
                        return done(null, user);
                    });

                }
            });

        }));

    /*
     ************ Google *************
     */

    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    app.passport.use(new GoogleStrategy(
        {
            clientID      : myEnv.gAppId,
            clientSecret   : myEnv.gAppSecret,
            //callbackURL      : myEnv.callbackURL,  // This is dynamically supplied
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function (req, token, refreshToken, profile, done) {

            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "In Passport Google code");

            // asynchronous
            process.nextTick(function () {

                app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Google User Data:  " + JSON.stringify(profile));

                // check if the user is already logged in
                if (!req.user) {
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Google: User already not logged in");

                    models.UserModel.findOne({ 'google.id': profile.id }, function (err, user) {
                        if (err) {
                            return done(err);
                        }

                        if (user) {

                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Google: found user..was there a token?");

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.google.token) {
                                user.google.token = token;
                                user.google.username = (profile.username || '');
                                user.name = profile.displayName;
                                if (profile.email) {
                                    user.google.email = (profile.emails[0].value || '').toLowerCase();
                                } else {
                                    user.google.email = '';
                                }

                                user.save(function (err) {
                                    if (err) {
                                        return done(err);
                                    }

                                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Google: linked token.");

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Google: Creating new user!");
                            var newUser = new models.UserModel();

                            newUser.google.id = profile.id;
                            newUser.google.token = token;
                            newUser.google.username = profile.username;
                            newUser.name = profile.displayName;

                            if (profile.email) {
                                newUser.google.email = (profile.emails[0].value || '').toLowerCase();
                            } else {
                                newUser.google.email = '';
                            }

                            newUser.save(function (err) {
                                if (err) {
                                    return done(err);
                                }

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Google: User already already logged in");
                    var user = req.user; // pull the user out of the session

                    user.google.id = profile.id;
                    user.google.token = token;
                    user.name = profile.displayName;

                    if (profile.email) {
                        user.google.email = (profile.emails[0].value || '').toLowerCase();
                    } else {
                        user.google.email = '';
                    }

                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Google updated user = " + JSON.stringify(user));

                    user.save(function (err) {
                        if (err) {
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Google: existing user error: " + err);
                            return done(err);
                        }
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Google: Saving any changed user info.");
                        return done(null, user);
                    });

                }
            });

        }));

    return {};

};
