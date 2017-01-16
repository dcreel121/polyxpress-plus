/*****
* CF Version 6.02
* Presently, not using a manifest file..but could
******/

// Login
cf login

// Push
cf target -s <space>
	<space> == production, development, or staging
cf push px

// View log files

cf files px logs/stdout.log
cf files px logs/env.log

// Other cool stuff (set env, etc.)
cf help

// Upgrade
// Download from https://github.com/cloudfoundry/cli

/* Check on health of apps via cf command or at web console *
// url: console.run.pivotal.io

/*******************************************************/

/******
 **  Below is deprecated!  Was for cf (version 5.4)
 **  I have upgraded to cf (version 6.0)
 **  It no longer is installed from "gem".  Can download the
 **  latest here:  https://github.com/cloudfoundry/cli
 **  (( I haven't updated below since upgrade.  For example,
 **  doesn't seem to use manifest files by default.)
 *******/

/*
 * Handling CF spaces
 */

To go push to the development space (app=pxDev), need to:

cf switch-space development
cp manifest.DEV.yml manifest.yml

To push to the production space (app=px), need to:

cf switch-space production
cp manifest.PROD.yml manifest.yml

Note:  NewRelic is only activated for the development site.

/*
 * cf commands
 */
http://docs.cloudfoundry.com/docs/using/managing-apps/cf/index.html

/*
 * cf updating
 */
gem update cf  // get latest version of cf

/*
 * cf authentication
 */
cf target api.run.pivotal.io  // Add target of push
cf login  // login

/*
 * cf app management
 */
cf apps  // List apps I have pushed to cloudfoundry
cf push  // add a new app (derived from current dir) to cloudfoundry
cf push --reset  // use to update app when manifest.yml has changed
cf restart
cf services

/*
 * cf app troubleshooting
 */
cf logs // List log data for current app
cf tail // tail logs
cf stats // List stats data for current app
cf health // List stats data for current app
cf crashlogs // get crash info
cf env // get environment variabls

cf start||restart // start or restart app

