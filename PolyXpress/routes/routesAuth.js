/**
 * PolyXpress Restful Web API routes for Authorization
 *
 * Description:
 *
 * Copyright:
 * License:
 *
 * Initial Author: Michael Haungs
 */

/*
 ************ Authentication Routes (first login) *************
 */

module.exports = function (app, models) {

    // Authentication routes :: Facebook
    // @todo add scope = email again {scope: "email"}
    app.get('/player/auth/facebook', function (req, res, next) {
        app.passport.authenticate('facebook', { scope: 'email', callbackURL: "/player/auth/facebook/callback"})(req, res, next);
    });

    app.get('/designer/auth/facebook', function (req, res, next) {
        app.passport.authenticate('facebook', { scope: 'email', callbackURL: "/designer/auth/facebook/callback"})(req, res, next);
    });

    app.get('/admin/auth/facebook', function (req, res, next) {
        app.passport.authenticate('facebook', { scope: 'email', callbackURL: "/admin/auth/facebook/callback"})(req, res, next);
    });

    app.get('/player/auth/facebook/callback', function (req, res, next) {
        app.passport.authenticate('facebook', {
            callbackURL    : "/player/auth/facebook/callback",
            successRedirect: "/PolyXpress/Player/pePlayer.html",
            failureRedirect: "/PolyXpress/Player/pePlayer.html"
        })
        (req, res, next);
    });

    app.get('/designer/auth/facebook/callback', function (req, res, next) {
        app.passport.authenticate('facebook', {
            callbackURL    : "/designer/auth/facebook/callback",
            successRedirect: "/PolyXpress/Author/peDesignerMain.html",
            failureRedirect: "/PolyXpress/Author/peDesignerMain.html"
        })
        (req, res, next);
    });

    app.get('/admin/auth/facebook/callback', function (req, res, next) {
        app.passport.authenticate('facebook', {
            callbackURL    : "/admin/auth/facebook/callback",
            successRedirect: "/private/admin.html",
            failureRedirect: "/private/login.html"
        })
        (req, res, next);
    });

    // Authentication routes :: Twitter
    // @todo add scope = email again {scope: "email"}
    app.get('/player/auth/twitter', function (req, res, next) {
        app.passport.authenticate('twitter', { scope: 'email', callbackURL: "/player/auth/twitter/callback"})(req, res, next);
    });

    app.get('/designer/auth/twitter', function (req, res, next) {
        app.passport.authenticate('twitter', { scope: 'email', callbackURL: "/designer/auth/twitter/callback"})(req, res, next);
    });

    app.get('/player/auth/twitter/callback', function (req, res, next) {
        app.passport.authenticate('twitter', {
            callbackURL    : "/player/auth/twitter/callback",
            successRedirect: "/PolyXpress/Player/pePlayer.html",
            failureRedirect: "/PolyXpress/Player/pePlayer.html"
        })
        (req, res, next);
    });

    app.get('/designer/auth/twitter/callback', function (req, res, next) {
        app.passport.authenticate('twitter', {
            callbackURL    : "/designer/auth/twitter/callback",
            successRedirect: "/PolyXpress/Author/peDesignerMain.html",
            failureRedirect: "/PolyXpress/Author/peDesignerMain.html"
        })
        (req, res, next);
    });

    // Authentication routes :: Google
    app.get('/player/auth/google', function (req, res, next) {
        app.passport.authenticate('google', {scope: ["profile", "email"], callbackURL: "/player/auth/google/callback"})(req, res, next);
    });

    app.get('/designer/auth/google', function (req, res, next) {
        app.passport.authenticate('google', {scope: ["profile", "email"], callbackURL: "/designer/auth/google/callback"})(req, res, next);
    });

    app.get('/player/auth/google/callback', function (req, res, next) {
        app.passport.authenticate('google', {
            callbackURL    : "/player/auth/google/callback",
            successRedirect: "/PolyXpress/Player/pePlayer.html",
            failureRedirect: "/PolyXpress/Player/pePlayer.html"
        })
        (req, res, next);
    });

    app.get('/designer/auth/google/callback', function (req, res, next) {
        app.passport.authenticate('google', {
            callbackURL    : "/designer/auth/google/callback",
            successRedirect: "/PolyXpress/Author/peDesignerMain.html",
            failureRedirect: "/PolyXpress/Author/peDesignerMain.html"
        })
        (req, res, next);
    });

    /*
     ************ Authorization (logging out) *************
     */

    app.get('/player/logout', function (req, res) {
        req.logout();
        res.redirect("/PolyXpress/Player/pePlayer.html");
    });

    app.get('/designer/logout', function (req, res) {
        req.logout();
        res.redirect("/PolyXpress/Author/peDesignerMain.html");
    });

    app.get('/admin/logout', function (req, res) {
        req.logout();
        res.redirect("/private/login.html");
    });

    /*
     ************ Authorization (Logged in, linking social accounts) *************
     */

    // facebook -------------------------------

    // send to facebook to do the authorization for linking
    app.get('/connect/facebook',
            app.passport.authorize('facebook', { scope: 'email', callbackURL: "/connect/facebook/callback", failureRedirect: '/' })
    );

    app.get('/connect/facebook/callback',
            app.passport.authorize('facebook', { scope: 'email', callbackURL: "/connect/facebook/callback", failureRedirect: '/' }),
            function (req, res) {
                res.redirect('/PolyXpress/Player/pePlayer.html');
            }
    );

    /*app.get('/connect/facebook', function (req, res, next) {
        app.passport.authorize('facebook', { scope: 'email', callbackURL: "/player/connect/facebook/callback"})(req, res, next);
    });

    // handle the callback after facebook has authorized the user
    app.get('/player/connect/facebook/callback', function (req, res, next) {
        app.passport.authorize('facebook', {
            callbackURL    : "/player/connect/facebook/callback",
            successRedirect: '/PolyXpress/Player/pePlayer.html#account',
            failureRedirect: '/PolyXpress/Player/pePlayer.html'
        })(req, res, next);
    });*/

    // twitter --------------------------------

    // send to twitter to do the authorization for linking
    app.get('/connect/twitter',
            app.passport.authorize('twitter', { scope: 'email', callbackURL: "/connect/twitter/callback", failureRedirect: '/' })
    );

    app.get('/connect/twitter/callback',
            app.passport.authorize('twitter', { scope: 'email', callbackURL: "/connect/twitter/callback", failureRedirect: '/' }),
            function (req, res) {
                res.redirect('/PolyXpress/Player/pePlayer.html');
            }
    );

    // google ---------------------------------

    // send to google to do the authorization for linking
    app.get('/connect/google',
            app.passport.authorize('google', { scope: ['profile', 'email'], callbackURL: "/connect/google/callback", failureRedirect: '/' })
    );

    app.get('/connect/google/callback',
            app.passport.authorize('google', { scope: ['profile', 'email'], callbackURL: "/connect/google/callback", failureRedirect: '/' }),
            function (req, res) {
                res.redirect('/PolyXpress/Player/pePlayer.html');
            }
    );

    /*
     ************ Authorization (Logged in, unlinking social accounts *************
     */

    // facebook -------------------------------
    app.get('/unlink/facebook', function (req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.redirect('/PolyXpress/Player/pePlayer.html#account');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', function (req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.save(function (err) {
            res.redirect('/PolyXpress/Player/pePlayer.html#account');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', function (req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function (err) {
            res.redirect('/PolyXpress/Player/pePlayer.html#account');
        });
    });
}
;