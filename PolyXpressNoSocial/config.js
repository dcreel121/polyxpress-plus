/**
 * PolyXpress Configuration
 *
 */

module.exports = function (app, express, models) {

    // Utilities
    var path = require('path');

    // Middleware
    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var methodOverride = require('method-override');
    var session = require('express-session');
    var bodyParser = require('body-parser');
    var cookieParser = require('cookie-parser');
    var errorHandler = require('errorhandler');

    // DB support
    var MongoStore = require('connect-mongo')(session);

    var dbConfig = require('./configs/database.js')(app);

    // Authorization
    var passportConf = require('./configs/passport.js')(app, models, dbConfig);

    // Add performance monitoring...only adding to development at this time
    if (app.cloud.runningInCloud) {
        if (dbConfig.vcapApplication.space_name === 'development') {
            require('newrelic');
        }
    }

    var config = this;

    // express situational configuration
    app.restrictedStaticMiddleware = express.static(__dirname + '/private');

    // express configuration (defaults to all configurations)
    app.set('port', app.cloud.port || 3500);
    app.use(logger('dev'));  // @todo 'dev' logs all requests to the console
    app.use(favicon(path.join(__dirname, "public/images/favicon.ico")));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(session({secret: "diesel",
                        cookie: {maxAge: 24 * 60 * 60 * 1000},
                        store : new MongoStore({url: dbConfig.mongourl}),
                        saveUninitialized: true,
                        resave: true}));
    //app.use(app.everyauth.middleware()); // @todo change this to password
    app.use(app.passport.initialize());
    app.use(app.passport.session());
    app.use(methodOverride());
    app.use(express.static(__dirname + "/public"));
    app.use(errorHandler());

    // Testing setup
    app.requireAuth = true;

    app.mongoose.connect(dbConfig.mongourl);

    return config;
};

