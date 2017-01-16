Welcome to PolyXpress
==========

## Introduction

PolyXpress allows you to create location-based stories, build eTours, or create restaurant guides. It is the tool 
that will bring people to locations in order to entertain, educate, or provide amazing deals.

## Documentation

* Official [PolyXpress Wiki](https://github.com/mhaungs/PX/wiki)
* [User Documentation](http://mhaungs.github.io/PolyXpress/peGuide.html)
* User Tutorial
* [Developer Tutorial](https://github.com/mhaungs/PolyXpressTutorial/wiki/Tutorial)

## Code Structure

Here is a list of the technologies used for client-side development:

* jquery mobile (thinking of moving to famo.us)
* jquery
* google maps api
* inject.js (for javascript modules)

Here is the list of technologies used for the static home pages:

* bootstrap 3.0

Here is the list of technologies used for the server:

* Node.js
* Mongoose.js
* MongoDB
* Express.js
* newrelic
* everyauth

Here is the list of deployment and testing technologies:

* To be added soon.

## Developer Workflow

1. Anything in the master branch is deployable
2. To work on something new, create a descriptively named branch off of master (ie: new-oauth2-scopes)
    * Webstorm:  Open new task (automatically creates branch, context, and changelist)
    * Command line:  git checkout -b "new branch name"
3. Commit to that branch locally and regularly push to branch to server.  (Have Jenkins setup to run
tests on every branch that is pushed.)
    * Webstorm:  Commit and push:  Select checkbox to create new branch on server for the first push.
    * Command line:  (1) git commit -a -m "message"  (2) git push -u origin "branch name" (first time..just "git push" afterwards)
4. When you think the branch is ready for merging or you need help, open a pull request.
5. After someone else has reviewed and signed off on the feature, you can merge it into master
6. Deploy!!

(Slightly modified) Read this for more detail:  [Github Workflow](http://scottchacon.com/2011/08/31/github-flow.html)

### Deploying to the Pivotal Web Service

PolyXpress has three cloud services to deploy to: production, development and staging.  The development service reflects the
current state of the master branch.  Once the master branch has successfully been used on the development service, then push 
it to the production.  Presently, no set use for the staging service.

1. After merging with master, push deployment to "development" target on Cloud Foundry.
2. After additional testing (1-3 weeks), push deployment to "production" target on Cloud Foundry.

#### CF command summary:

1. cf login
2. cf target -s "production|development|staging"
3. cf push px
