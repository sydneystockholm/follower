var lib_dir = process.env.JS_COV ? '../lib-cov/': '../lib/';

var Google = require(lib_dir + 'google').Google
  , request = require(lib_dir + 'request')
  , assert = require('assert');

var google = new Google(request);

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

