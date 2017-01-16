/**
 * @name customSettings
 * @version 0.1 [June 1, 2014]
 * @author Michael Haungs
 * @copyright Copyright 2012 Michael Haungs [mhaungs at calpoly.edu]
 * @license MIT
 * @desc set jquery mobile, map defaults
 */

/* a quick reminder of jsdoc tags */
// Tags to use below:  @todo, @this, @public, @private, @desc, @constant

/*
 * Set jquery mobile spinner defaults
 */
$(document).bind("mobileinit", function() {
    console.log("Mobile Init");
    $.mobile.page.prototype.options.theme = "a";
});

