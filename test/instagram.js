var Instagram = require('../lib/instagram').Instagram
  , config = require('./config')
  , test = require('tape').test;

var has_secret = config.instagram_secret.length > 0 ? true : false;
var username = 'instagram';
var hashtag = 'yolo';

var instagram = new Instagram({
    client_id: config.instagram_client_id
  , secret: config.instagram_secret
});

test('get follower count for a user', function(t) {
    instagram.followerCount(username, function (err, followers) {
        t.error(err);
        t.equal(typeof followers, 'number');
        t.assert(followers > 0);
        t.end();
    });
});

test('should fail with an invalid username', function(t) {
    instagram.followerCount('', function (err) {
        t.assert(err);
    });
    instagram.latestMedia('', function (err) {
        t.assert(err);
    });
    t.end();
});

test('get latest media from a user', function(t) {
    instagram.latestMedia(username, function (err, media) {
        t.error(err);
        t.assert(Array.isArray(media) && media.length);
        var item = media[0];
        t.assert(item.id && item.is_video !== 'undefined' && item.comments &&
                 item.likes && item.code && item.image && item.owner &&
                 item.date, 'check that a media item has proper attributes');
        t.end();
    });
});

test('get latest media for a hashtag', function(t) {
    if (has_secret === true) {
        instagram.latestHashtagMedia(hashtag, function (err, media) {
            t.error(err);
            var item = media[0];
            t.assert(item.id && item.type && item.link && item.image &&
                     item.user && item.date.getTime() > 0 &&
                     typeof item.caption !== 'undefined',
                     'check that a media item has proper attributes');
        });
    } else {
        t.skip('no instagram secret');
    }
    t.end();
});
