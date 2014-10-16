var Pinterest = require('../lib/pinterest').Pinterest
  , assert = require('assert');

var pinterest = new Pinterest();

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

    describe('#latestMedia', function () {

        it('should get the latest media from a user', function (done) {
            pinterest.latestMedia('souvlakiman', function (err, media) {
                assert.ifError(err);
                assert(Array.isArray(media) && media.length);
                media.forEach(function (item) {
                    assert(item.id);
                    assert(item.description);
                    assert(item.board);
                    assert(item.user);
                    assert(typeof item.link !== 'undefined');
                    assert(item.image);
                });
                done();
            });
        });

        it('should get the latest media from a user\'s board', function (done) {
            pinterest.latestMedia('souvlakiman', 'recipes', function (err, media) {
                assert.ifError(err);
                assert(Array.isArray(media) && media.length);
                media.forEach(function (item) {
                    assert(item.id);
                    assert(item.description);
                    assert(item.board);
                    assert(item.user);
                    assert(typeof item.link !== 'undefined');
                    assert(item.image);
                });
                done();
            });
        });

        it('should fail when an invalid username is given', function (done) {
            pinterest.latestMedia('casdfa89sd7f9asdf', function (err) {
                assert(err);
                done();
            });
        });

        it('should fail when an invalid board is given', function (done) {
            pinterest.latestMedia('souvlakiman', 'adosifaksdfjas', function (err) {
                assert(err);
                done();
            });
        });

    });

});
