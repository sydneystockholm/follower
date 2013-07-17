var lib_dir = process.env.JS_COV ? '../lib-cov/': '../lib/';

var google = require(lib_dir + 'google')
  , assert = require('assert');

describe('Google', function () {

    describe('#urlPlusOnes', function () {

        it('should get the # of pins a url has', function (done) {
            google.urlPlusOnes('http://google.com', function (err, plus_ones) {
                assert.ifError(err);
                assert(typeof plus_ones === 'number');
                assert(plus_ones > 0);
                done();
            });
        });

        it('should fail on an invalid url', function (done) {
            google.urlPlusOnes(')(A*SD()AS*D)(@!', function (err) {
                assert(err);
                done();
            });
        });

    });

});

