var Facebook = require('../lib/facebook').Facebook
  , assert = require('assert');

var facebook = new Facebook();

describe('Facebook', function () {

    describe('#urlLikes', function () {

        it('should get the # of likes a url has', function (done) {
            facebook.urlLikes('http://stoneyroads.com/2014/12/watch-a-steve-aoki-impersonator-troll-stereosonic-perth', function (err, likes) {
                assert.ifError(err);
                assert(typeof likes === 'number');
                assert(likes > 0);
                done();
            });
        });

        it('should fail on an invalid url', function (done) {
            facebook.urlLikes('!@(*#&!(@*#&!', function (err) {
                assert(err);
                done();
            });
        });

    });

    describe('#urlComments', function () {
        it('should get the # of comments a url has', function(done) {
            facebook.urlComments('http://facebook.com', function (err, comments) {
                assert.ifError(err);
                assert(typeof comments === 'number');
                assert(comments > 0);
                done();
            });
        });

        it('should fail on an invalid url', function (done) {
            facebook.urlComments('!@(*#&!(@*#&!', function (err) {
                assert(err);
                done();
            });
        });
    });

    describe('#pageLikes', function () {

        it('should get the # of likes a facebook page has', function (done) {
            facebook.pageLikes('https://www.facebook.com/baconaddicts', function (err, likes) {
                assert.ifError(err);
                assert(typeof likes === 'number');
                assert(likes > 0);
                done();
            });
        });

        it('should get the # of likes a facebook page (without a vanity url) has', function (done) {
            facebook.pageLikes('facebook.com/pages/Bacon/113009932047080', function (err, likes) {
                assert.ifError(err);
                assert(typeof likes === 'number');
                assert(likes > 0);
                done();
            });
        });

        it('should accept a page ID rather than url', function (done) {
            facebook.pageLikes('baconaddicts', function (err, likes) {
                assert.ifError(err);
                assert(typeof likes === 'number');
                assert(likes > 0);
                done();
            });
        });

        it('should fail on an invalid page url', function (done) {
            facebook.pageLikes('!@(*#&!(@*#&!', function (err) {
                assert(err);
                facebook.pageLikes('http://google.com', function (err) {
                    assert(err);
                    done();
                });
            });
        });

    });

});
