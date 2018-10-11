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
        }
        else if (cloudEnv.vcapApplication.space_name === 'production') {
            myEnv.fbAppId = auths.facebookAuthProd.clientID;
            myEnv.fbAppSecret = auths.facebookAuthProd.clientSecret;
            myEnv.callbackURL = auths.facebookAuthProd.callbackURL;
        }
        else if (cloudEnv.vcapApplication.space_name === 'staging') {
            // @todo Presently, do not use "staging" and new services are configured for it.
            myEnv.fbAppId = auths.facebookAuthStage.clientID;
            myEnv.fbAppSecret = auths.facebookAuthStage.clientSecret;
            myEnv.callbackURL = auths.facebookAuthStage.callbackURL;
        }
    }
    else {
        // Configure Facebook Authentication Info (pxTest Facebook App)
        myEnv.fbAppId = auths.facebookAuthLocal.clientID;
        myEnv.fbAppSecret = auths.facebookAuthLocal.clientSecret;
        myEnv.callbackURL = auths.facebookAuthLocal.callbackURL;

        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "fbAppId = " + myEnv.fbAppId);
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

                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Finding user model if facebook id: " + profile.id);
                    models.UserModel.findOne({ 'facebook.id': profile.id }, function (err, user) 
                    {
                        if (err) {
                            return done(err);
                        }

                        if (user) {

                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Found facebook user with fb id " + user.facebook.id);

                            // if there is a user id already but no token (user was linked at one point and then removed)

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
                                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Found Friends: " + JSON.stringify(installed));
                                
                                    // Save the Facebook ID of the installed friends to look up friends later.
                                    installed.map(function(friend) { user.facebook.friends.push(friend.id); });

                                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "saving user with fb id " + user.facebook.id);
                                    user.save(function (err) {
                                        if (err) {
                                            return done(err);
                                        }

                                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook: linked token.");
                                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "returning here1");
                                        return done(null, user);
                                    });
                                });
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "returning user with fb id " + user.facebook.id);
                            return done(null, user); // user found, return that user
                        } 
                        else {
                            // if there is no user, create them
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook: Creating new user with fb id " + profile.id);
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
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "About to make call for friends 2");
                            return app.fb.get('/' + profile.id + '/friends?fields=installed', function(err, res) 
                            {
                                // Reset friends list
                                newUser.facebook.friends = [];

                                // Retrieve friends that have the app installed from the Facebook friend list.
                                var installed = res.data.filter(function (friend) {return friend.installed; });
                                
                                // Save the Facebook ID of the installed friends to look up friends later.
                                installed.map(function(user) { newUser.facebook.friends.push(user.id); });

                                return app.fb.get('/' + profile.id + '/picture', function(err, res) 
                                {
                                    // Save the Facebook profile picture
                                    newUser.facebook.picture = res.location;


                                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "saving new user with fb id " + newUser.facebook.id);
                                    newUser.save(function (err) {
                                        if (err) {
                                            return done(err);
                                        }
                                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "returning ne user with fb id " + newUser.facebook.id);
                                        return done(null, newUser);
                                    });
                                });
                            });
                        }
                    });
                } 
                else {
                    // user already exists and is logged in, we have to link accounts
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook: User exists and is already logged in for id " + profile.id);
                    var user = req.user; // pull the user out of the session

                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "updating faceook info? id was " + user.facebook.id + " and is now " + profile.id);

                    user.facebook.id = profile.id;
                    user.facebook.token = token;
                    user.name = profile.displayName;

                    if (profile.email) {
                        user.facebook.email = (profile.emails[0].value || '').toLowerCase();
                    } else {
                        user.facebook.email = '';
                    }
                    // Get extra Facebook info (friends list and profile picture)
                    app.mhLog.log(app.mhLog.LEVEL.DEBUG, "About to make call for friends 3");
                    return app.fb.get('/' + profile.id + '/friends?fields=installed', function(err, res) 
                    {
                        app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Friends: " + JSON.stringify(res.data));

                        // Reset friends list
                        user.facebook.friends = [];

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
                            app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Facebook: Saving any changed user info. fb id " + user.facebook.id);
                            return done(null, user);
                        });
                    });
                }
            });

        }));

    return {};

};
