var Pinterest = require('../lib/pinterest').Pinterest
  , test = require('tape').test;

var pinterest = new Pinterest();

test('get pins count for url', function (t) {
    pinterest.urlPins('http://facebook.com', function (err, pins) {
        t.error(err);
        t.equal(typeof pins, 'number');
        t.assert(pins > 0);
        t.end();
    });
});

test('should fail on an invalid url', function (t) {
    pinterest.urlPins('', function (err) {
        t.assert(err);
        t.end();
    });
});

test('should fail when an invalid username is given', function (t) {
    pinterest.latestMedia('casdfa89sd7f9asdf', function (err) {
        t.assert(err);
        t.end();
    });
});

test('should fail when an invalid board is given', function (t) {
    pinterest.latestMedia('souvlakiman', 'adosifaksdfjas', function (err) {
        t.assert(err);
        t.end();
    });
});

test('should get the latest media from a user', function (t) {
    pinterest.latestMedia('souvlakiman', function (err, media) {
        t.error(err);
        t.assert(Array.isArray(media) && media.length);
        var item = media[0];
        t.assert(item.id && item.description && item.board && item.user &&
          typeof item.link !== 'undefined' && item.image,
                 'check that a media item has proper attributes');
        t.end();
    });
});

test('should get the latest media from a user\'s board', function (t) {
    pinterest.latestMedia('souvlakiman', 'recipes', function (err, media) {
        t.ifError(err);
        t.assert(Array.isArray(media) && media.length);
        var item = media[0];
        t.assert(item.id && item.description && item.board && item.user &&
          typeof item.link !== 'undefined' && item.image,
                 'check that a media item has proper attributes');
        t.end();
    });
});
