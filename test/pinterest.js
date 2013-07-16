var lib_dir = process.env.JS_COV ? '../lib-cov/': '../lib/';

var pinterest = require(lib_dir + 'pinterest')
  , assert = require('assert');

describe('Pinterest', function () {

    describe('#urlPins', function () {

        it('should get the # of pins a url has', function (done) {
            pinterest.urlPins('http://facebook.com', function (err, pins) {
                assert.ifError(err);
                assert(typeof pins === 'number');
                assert(pins > 0);
                done();
            });
        });

        it('should fail on an invalid url', function (done) {
            pinterest.urlPins('', function (err) {
                assert(err);
                done();
            });
        });

    });

});

