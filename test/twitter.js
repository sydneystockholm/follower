var Twitter = require('../lib/twitter').Twitter
  , config = require('./config')
  , test = require('tape').test;

var twitter = new Twitter({
    key: config.twitter_key
  , secret: config.twitter_secret
});

var has_secret = config.twitter_secret.length > 0 ? true : false;
var username = 'eatingfoodbrb';
var hashtag = 'yolo';

test('should get the # of followers a user has', function (t) {
    if (has_secret === true) {
        twitter.followerCount('eatingfoodbrb', function (err, followers) {
            t.error(err);
            t.equal(typeof followers, 'number');
            t.assert(followers > 0);
        });
    } else {
        t.skip('no twitter secret');
    }
    t.end();
});

test('should fail on an invalid username', function (t) {
    twitter.followerCount('', function (err) {
        t.assert(err);
        t.end();
    });
});

test('should get the # of tweets a url has', function (t) {
    twitter.urlTweets('http://twitter.com', function (err, tweets) {
        t.error(err);
        t.equal(typeof tweets, 'number');
        t.assert(tweets > 0);
        t.end();
    });
});

test('should fail on an invalid url', function (t) {
    twitter.urlTweets('', function (err) {
        t.assert(err);
        t.end();
    });
});

test('should get the latest tweets from a user', function (t) {
    if (has_secret === true) {
        twitter.latestTweets(username, function (err, tweets) {
            t.error(err);
            var item = tweets[0];
            t.assert(item.id && item.text && item.user &&
                     item.entities && item.date.getTime() > 0,
                     'check that a media item has proper attributes');
        });
    } else {
        t.skip('no twitter secret');
    }
    t.end();
});

test('should get the latest tweets by hashtag', function (t) {
    if (has_secret === true) {
        twitter.latestHashtagTweets(hashtag, function (err, tweets) {
            t.error(err);
            var item = tweets[0];
            t.assert(item.id && item.text && item.user &&
                     item.entities && item.date.getTime() > 0,
                     'check that a media item has proper attributes');
        });
    } else {
        t.skip('no twitter secret');
    }
    t.end();
});
