var temp = require("src/js/temp.js");
var mhLog = require("mhlog.js")();

main();

function main() {
    mhLog.setLoggingLevel(mhLog.LEVEL.ALL);
    mhLog.log(mhLog.LEVEL.DEBUG, "In testMhlog.js:main " + temp.msg);
    oneLevelDeep();
}

function oneLevelDeep() {
    mhLog.log(mhLog.LEVEL.DEBUG, "In testMhlog.js:oneLevelDeep");
    twoLevelDeep();
}

function twoLevelDeep() {
    mhLog.log(mhLog.LEVEL.DEBUG, "In testMhlog.js:twoLevelDeep");
}

