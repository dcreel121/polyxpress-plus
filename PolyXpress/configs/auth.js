// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuthDev': {
        'clientID'    : '303583989772545', // your App ID
        'clientSecret': 'f2f1e2644fc2ca95926f53ae4deb1eb4', // your App Secret
        'callbackURL' : 'http://localhost:3500/auth/facebook/callback' // dynamically changed in code
    },

    'facebookAuthProd': {
        'clientID'    : '178092958994994', // your App ID
        'clientSecret': 'f8d939b517c1cd5239823dbeb27ba736', // your App Secret
        'callbackURL' : 'http://localhost:3500/auth/facebook/callback' // dynamically changed in code
    },

    'facebookAuthStage': {  // @todo replace with valid IDs for staging area
        'clientID'    : '178092958994994', // your App ID
        'clientSecret': 'f8d939b517c1cd5239823dbeb27ba736', // your App Secret
        'callbackURL' : 'http://localhost:3500/auth/facebook/callback'
    },

    'facebookAuthLocal': {
        'clientID'    : '303583989772545', // your App ID
        'clientSecret': 'f2f1e2644fc2ca95926f53ae4deb1eb4', // your App Secret
        'callbackURL' : 'http://localhost:3500/auth/facebook/callback' // dynamically changed in code
    },

    // @todo only twitterAuthLocal has valid twitter keys
    'twitterAuthDev'   : {
        'clientID'    : '8jdbofYtMaTB26efLCDTs0iJJ', // your App ID
        'clientSecret': 'BBdGSZAeGFiITf0maGJDzuhJKDZLD1jGbEwpr0IxI8vXpeTX3q', // your App Secret
        'callbackURL' : 'http://pxdev.cfapps.io/auth/twitter/callback' // dynamically changed in code
    },

    'twitterAuthProd': {
        'clientID'    : 'xfpp4XI6wktkYFz3pM0EbNCLy', // your App ID
        'clientSecret': '5hAOqg5bZi10yF23NEu6OB20hxhoSQpOHBE3y8Xy5R2NT6lesG', // your App Secret
        'callbackURL' : 'http://px.cfapps.io/auth/twitter/callback' // dynamically changed in code
    },

    'twitterAuthStage': {  // @todo replace with valid IDs for staging area
        'clientID'    : 'x2Ze9sSdkMscV1KkMXLiUwJLF', // your App ID
        'clientSecret': 'axJwPbgv8qyrPtDBexF1RYdAHJjpdmEsdCp6KpaidzooqPDCeC', // your App Secret
        'callbackURL' : 'http://localhost:3500/auth/twitter/callback'
    },

    'twitterAuthLocal': {
        'clientID'    : 'x2Ze9sSdkMscV1KkMXLiUwJLF', // your App ID
        'clientSecret': 'axJwPbgv8qyrPtDBexF1RYdAHJjpdmEsdCp6KpaidzooqPDCeC', // your App Secret
        'callbackURL' : 'http://localhost:3500/auth/twitter/callback' // dynamically changed in code
    },

    // google allows one clientID/clientSecret to serve multiple domains, thus all the same
    'googleAuthDev'   : {
        'clientID'    : '84453235164-cbffj609lhqphholm06mpq1emkhmirr5.apps.googleusercontent.com',
        'clientSecret': 'aPxIs7a2jK2kC5q7AULozoSG',
        'callbackURL' : "http://localhost:3500/auth/google/callback" // dynamically changed in code
    },

    'googleAuthProd': {
        'clientID'    : '84453235164-cbffj609lhqphholm06mpq1emkhmirr5.apps.googleusercontent.com',
        'clientSecret': 'aPxIs7a2jK2kC5q7AULozoSG',
        'callbackURL' : "http://localhost:3500/auth/google/callback" // dynamically changed in code
    },

    'googleAuthStage': {
        'clientID'    : '84453235164-cbffj609lhqphholm06mpq1emkhmirr5.apps.googleusercontent.com',
        'clientSecret': 'aPxIs7a2jK2kC5q7AULozoSG',
        'callbackURL' : "http://localhost:3500/auth/google/callback" // dynamically changed in code
    },

    'googleAuthLocal': {
        'clientID'    : '84453235164-cbffj609lhqphholm06mpq1emkhmirr5.apps.googleusercontent.com',
        'clientSecret': 'aPxIs7a2jK2kC5q7AULozoSG',
        'callbackURL' : "http://localhost:3500/auth/google/callback" // dynamically changed in code
    }

};