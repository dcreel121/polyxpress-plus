/**
 * Created by mhaungs on 11/6/14.
 */
var request = require('supertest');
var chai = require("chai");
var expect = chai.expect;

// Configuration
chai.config.includeStack = false; // turn on stack trace
chai.config.showDiff = false; // turn on diffs
request = request('http://localhost:3500');

describe('Defaults', function () {
    // Variables

    // Hooks
    before("Turn off Authentication...", function (done) {
        request.get('/peAPI/testON').expect(200, done);
    });

    after("Turn on Authentication...", function (done) {
        request.get('/peAPI/testOFF').expect(200, done);
    });

    // Testsuites
    describe('Routes -- User/Author', function () {
        it('GET /status should succeed', function (done) {
            request.get('/status')
                .expect(200)
                .expect('Content-Type', /html/)
                .expect(/Server Information/, done);
        });
        it('GET /peAPI/user/checkAuth should succeed', function (done) {
            request.get('/peAPI/user/checkAuth')  // Will always succeed because turn authentication off
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res, body) {
                         expect(res.body.loggedIn).to.be.true;
                         if (err) {
                             done(err);
                         } else {
                             done();
                         }
                     });
        });
        it('GET /peAPI/user/self');  // @todo Can't figure out a good way to implement this test
        it('PUT /peAPI/user/self');  // @todo Can't figure out a good way to implement this test
        it('GET /peAPI/author/search/ABCDEFG123456 should fail', function (done) {
            request.get('/peAPI/author/search/ABCDEFG123456')
                .expect(200)
                .end(function (err, res) {
                         expect(Object.keys(res.body).length).to.equal(0);
                         if (err) {
                             done(err);
                         } else {
                             done();
                         }
                     });
        });
        it('GET /peAPI/author/search/Haungs should succeed', function (done) {
            request.get('/peAPI/author/search/Haungs')
                .expect(200) // "Not Found" expected.
                .end(function (err, res) {
                         // Haungs author information in res.body
                         console.log("Haungs Body : " + JSON.stringify(res.body));
                         if (err) {
                             done(err);
                         } else {
                             done();
                         }
                     });
        });
    });

    describe('Routes -- Stories', function () {
        it('GET /peAPI/story/id/THISISNOTVALID should fail', function (done) {
            request.get('/peAPI/story/id/543af2a5f162500000000000')
                .expect(200)
                .end(function (err, res) {
                         expect(typeof res.body != "undefined" && res.body != null && res.body.length > 0).to.be.false;
                         if (err) {
                             done(err);
                         } else {
                             done();
                         }
                     });
        });
        it('GET /peAPI/story/keyword/:keyword');  // @todo Can't figure out a good way to implement this test
        it('GET /peAPI/story/recent');  // @todo Can't figure out a good way to implement this test
    });

    describe('Routes -- Chapters', function () {
        it('GET /peAPI/chapter/id/:id');  // @todo Can't figure out a good way to implement this test
        it('GET /peAPI/chapter/keyword/:keyword');  // @todo Can't figure out a good way to implement this test
    });

    describe('Routes -- Events', function () {
        it('GET /peAPI/event/id/:id');  // @todo Can't figure out a good way to implement this test
        it('GET /peAPI/event/keyword/:keyword');  // @todo Can't figure out a good way to implement this test
        it('GET /peAPI/event/id/:id');  // @todo Can't figure out a good way to implement this test
    });

    describe('Routes -- Session', function () {
        it('GET /peAPI/session/complete/chapter/:id');  // @todo Can't figure out a good way to implement this test
        it('GET /peAPI/session/complete/event/:id');  // @todo Can't figure out a good way to implement this test
        it('GET /peAPI/event/id/:id');  // @todo Can't figure out a good way to implement this test
    });

});