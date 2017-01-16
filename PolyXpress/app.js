/**
 * PolyXpress Server
 *
 * REST API: routes.js
 * Database Schemas: models/polyXpressModels.js
 * Express/Node Configuration: config.js
 */

// Setup NODE_ENV environment variable.  For testing, I set it to "development" in my
// .profile.  CloudFoundry does not set this variable.
var env = process.env.NODE_ENV || 'development'; //@todo presently not using this..not sure if works

// Modules/Dependencies
var express = require("express");
var app = module.exports = express(); // Main application container
app.passport = require("passport");
app.mongoose = require("mongoose");
app.cloud = require('cf-runtime').CloudApp;  // CloudFoundry Configuration Info
app.mhLog = require("mhlog")();
app.fb = require('fbgraph');

// Config log output
if (app.cloud.runningInCloud) {
    app.mhLog.setLoggingLevel(app.mhLog.LEVEL.ALL);
    app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, "Running in cloud.");
}
else {
    app.mhLog.setLoggingLevel(app.mhLog.LEVEL.ALL);
    app.mhLog.log(app.mhLog.LEVEL.ALL, "Running locally");
}
app.mhLog.setShowStackTrace(false);

// Models
var models = {};
models.UserModel = require("./models/polyXpressUserModels")(app.mongoose).model;
models.StoryModel = require("./models/polyXpressStoryModels")(app.mongoose).model;
models.ChapterModel = require("./models/polyXpressChapterModels")(app.mongoose).model;
models.EventModel = require("./models/polyXpressEventModels")(app.mongoose).model;
models.FeedModel = require("./models/polyXpressFeedModels")(app.mongoose).model;
models.CommentModel = require("./models/polyXpressCommentModels")(app.mongoose).model;
models.MessageModel = require("./models/polyXpressMessageModels")(app.mongoose).model;


// Config
var config = require("./config.js")(app, express, models);

// routes
require("./routes/routesAuth.js")(app, models); // will add routes for authorization
require("./routes/routes")(app, models);  // will add routes to app
require("./routes/routesCRUD")(app, models);  // will add routes to app
require("./routes/routesSocial")(app, models); // will add routes to app

// Start Web Application Server
app.mhLog.log(app.mhLog.LEVEL.DEBUG, "Running on port: " + (app.cloud.port || 3500));
app.listen(app.cloud.port || 3500);  // config sets port
