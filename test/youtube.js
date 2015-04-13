var Youtube = require('../lib/youtube').Youtube
  , test = require('tape').test;

var youtube = new Youtube();

test('should get the # of pins a url has', function (t) {
    youtube.latestMedia('TMZ', function (err, media) {
        t.error(err);
        t.assert(Array.isArray(media) && media.length);
        var item = media[0];
        t.assert(item.id && item.title && item.image && item.user &&
                 item.link && item.date.getTime() > 0,
                 'check that a media item has proper attributes');
        t.end();

    });
});

test('should fail on an invalid username', function (t) {
    youtube.latestMedia(')(A*SD()AS*D)(@!', function (err) {
        t.assert(err);
        t.end();
    });
});
