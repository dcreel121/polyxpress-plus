gem update vmc  // get latest version of vmc

vmc apps  // List apps I have pushed to cloudfoundry
vmc services // List provisioned services
vmc info // get info about foundry account

vmc push  // add a new app (derived from current dir) to cloudfoundry
vmc push --runtime=node08
vmc update // (deprecated: use push) Update the current app
vmc logs // List log data for current app

vmc start||restart // start or restart app

vmc target api.cloudfoundry.com  // Add target of push
vmc login  // login
