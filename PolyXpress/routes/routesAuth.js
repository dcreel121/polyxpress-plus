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
}
;