var lib_dir = process.env.JS_COV ? '../lib-cov/': '../lib/';

var facebook = require(lib_dir + 'facebook')
  , assert = require('assert');

describe('Facebook', function () {

    it('should get the # of likes a url has', function (done) {
        facebook.urlLikes('http://facebook.com', function (err, likes) {
            assert.ifError(err);
            assert(typeof likes === 'number');
            assert(likes > 0);
            done();
        });
    });

    it('should get the # of likes a facebook page has', function (done) {
        facebook.pageLikes('https://www.facebook.com/baconaddicts', function (err, likes) {
            assert.ifError(err);
            assert(typeof likes === 'number');
            assert(likes > 0);
            done();
        });
    });

    it('should fail when an invalid url is given to a function', function (done) {
        facebook.urlLikes('!@(*#&!(@*#&!', function (err) {
            assert(err);
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

