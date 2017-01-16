/*
 * Licensing and Copyright still under review...
 */

/*
 * peDesignerTestExporter
 *
 * Description:
 *
 *
 * @author mhaungs
 */

// Begin Module Header
(function(peDesignerTestExporter) {
// End Module Header

    "use strict";  // EMCAScript 5 pragma to catch more javascript error

    /*
     ************ Module Variables *************
     */

    /*
     ************ Initialization methods *************
     */
    peDesignerTestExporter.mhLog = require("mhlog");
    peDesignerTestExporter.peDM = require("src/js/peDesignerModel.js")();
    peDesignerTestExporter.peDS = require("src/js/peDesignerServer.js")();
    peDesignerTestExporter.peDC = require("src/js/peDesignerController.js")();

    /*
     ************ Public methods *************
     */

    /*
     ************ Private methods *************
     */

// Begin Module Footer
})(window.peDesignerTestExporter = window.peDesignerTestExporter || {});
// End Module Footer
