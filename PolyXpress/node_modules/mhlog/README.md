mhlog
=====

*mhlog* is a simple logging utility for node.js servers and client-side web applications that have javascript modules dynamically loaded via [inject] [1].

Installation
------------

To install *mhlog*, use [bower] [2] in the following way:

	bower install git@github.com:mhaungs/mhlog.git

Example
-------

Before going into specifics, here is a quick example of using *mhLog*.  First, you need to *require* mhLog.js:

	var mhLog = require("mhlog.js").mhLog;

Next, set the logging level:

	mhLog.setLoggingLevel(mhLog.LEVEL.ALL);

And, optionally, set whether or not you want an abbreviated stack trace to accompany the output:

	mhLog.setShowStackTrace(true);

Then, you use *mhLog.log* as you would *console.log*.  Here's an example:

	mhLog.log(mhLog.LEVEL.DEBUG, "Example message.");

Logging Levels
--------------

*mhLog* has four possible levels you can use:

* ALL:  All levels are logged
* DEBUG: DEBUG, DEVELOPMENT, and PRODUCTION messages are logged.
* DEVELOPMENT: DEVELOPMENT and PRODUCTION messages are logged.
* PRODUCTION: Only PRODUCTION levels are logged.

The intent is that long-term debugging messages use the DEBUG level and short-term exploration of code behavior  should use the DEVELOPMENT level.  The PRODUCTION level is for error and exception reporting.

Of course, you are free to use the levels in any way the makes sense to you.

Stack Traces
------------

To provide more information about the source of the message, you can also print an abbreviated stack trace along with your log message.  To turn on stack tracing, use the *setShowStackTrace* method.  It accepts a single boolean parameter.

The stack trace implementation is minimal.  It provides the names of the last four function called.  It works for Chrome, Firefox, and Safari.

License
-------
Copyright (c) 2013 Michael Haungs <mhaungs at calpoly.edu>


[1]: http://www.injectjs.com/
[2]: http://bower.io/
