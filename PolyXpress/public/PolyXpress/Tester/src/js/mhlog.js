/*
 * Licensing and Copyright still under review...
 */

/*
 * mhLog
 *
 * Description: A simple utility to control log output.
 *
 * Note: Eventually want to add file/console choices.
 *
 * @author mhaungs
 */

// Begin Module Header
(function(mhLog)
{
// End Module Header

    "use strict";  // EMCAScript 5 pragma to catch more javascript error

    /*
     ************ Module Variables *************
     */
    mhLog.LEVEL = {
        ALL: 0,
        DEBUG: 1,
        DEVELOPMENT: 2,
        PRODUCTION: 3
    };

    var currentLevel = mhLog.LEVEL.PRODUCTION;

    /*
     ************ Initialization methods *************
     */

    /*
     ************ Public methods *************
     */
    mhLog.setLoggingLevel = function(level)
    {
        if (levelValid(level))
        {
            currentLevel = level;
        }
    };

    mhLog.log = function(level, msg)
    {
        if (levelValid(level))
        {
            if (level >= currentLevel)
                console.log(msg);
        }
    };

    /*
     ************ Private methods *************
     */
    function levelValid(level)
    {
        return (level <= mhLog.LEVEL.PRODUCTION && level >= mhLog.LEVEL.ALL);
    }

// Begin Module Footer
})(this.mhLog = this.mhLog || {});
// End Module Footer

/*
 * Note: To make compatible with CommonJS, changed "window.mhLog" to just
 * "this.mhLog".  That way gets bound to global namespace for both 
 * node.js and browser environments.
 * 
 * Note: For node.js, this is not optimal as it introduces a global variable, 
 * however, this allows us to use one logging module for both the server and
 * client side.
 */

/*
 * Need this if statement to setup the exporting of this module correctly.
 * If this is in a browser, then need to create a global variable to access
 * contents.  If this is in node.js, then export contents via "module".
 */

if (typeof module !== "undefined")
{
    module.exports = this.mhLog;
}
else
{
    if (typeof window !== "undefined")
    {
        window.mhLog = this.mhLog;
    }
}
