module.exports = function (app) {

    var myDBConfig = {};

    // Needed for connection to localhost mongodb service
    var generate_mongo_url = function (obj) {
        obj.hostname = (obj.hostname || 'localhost');
        obj.port = (obj.port || 27017);
        obj.db = (obj.db || 'test');
        if (obj.username && obj.password) {
            return "mongodb://" + obj.username + ":" + obj.password + "@" +
                   obj.hostname + ":" + obj.port + "/" + obj.db;
        }
        else {
            return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
        }
    };

    // Parse environment variables to setup mongodb
    if (process.env) {
        if (app.cloud.runningInCloud) {
            // Configure MongoDB Service URL
            myDBConfig.vcapServices = JSON.parse(process.env.VCAP_SERVICES);
            myDBConfig.vcapApplication = JSON.parse(process.env.VCAP_APPLICATION);
            myDBConfig.mongourl = myDBConfig.vcapServices.mongolab[0].credentials.uri;
            myDBConfig.mongodb = myDBConfig.vcapServices.mongolab[0].name;
            app.mhLog.log(app.mhLog.LEVEL.PRODUCTION, "Space = " + myDBConfig.vcapApplication.space_name);
        }
        else {
            // Configure MongoDB Service URL
            var mongo = {
                "hostname": "localhost",
                "port"    : 27017,
                "username": "",
                "password": "",
                "name"    : "",
                "db"      : "pxDB"
            };
            myDBConfig.mongourl = generate_mongo_url(mongo);
            myDBConfig.mongodb = mongo.db;
        }
    }

    return myDBConfig;

}

