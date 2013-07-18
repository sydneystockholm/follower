var lib_dir = process.env.JS_COV ? '../lib-cov/': '../lib/';

var Twitter = require(lib_dir + 'twitter').Twitter
  , config = require('./config')
  , assert = require('assert');

var twitter = new Twitter({
    key: config.twitter_key
  , secret: config.twitter_secret
});

describe('Twitter', function () {

    describe('#followerCount', function () {

        it('should get the # of followers a user has', function (done) {
            twitter.followerCount('chris6F', function (err, followers) {
                assert.ifError(err);
                assert(typeof followers === 'number');
                assert(followers > 0);
                done();
            });
        });

        it('should fail on an invalid username', function (done) {
            twitter.followerCount('', function (err) {
                assert(err);
                done();
            });
        });

    });

    describe('#urlTweets', function () {

        it('should get the # of tweets a url has', function (done) {
            twitter.urlTweets('http://twitter.com', function (err, tweets) {
                assert.ifError(err);
                assert(typeof tweets === 'number');
                assert(tweets > 0);
                done();
            });
        });

        it('should fail on an invalid url', function (done) {
            twitter.urlTweets('', function (err) {
                assert(err);
                done();
            });
        });

    });

    describe('#latestTweets', function () {

        it('should get the latest tweets from a user', function (done) {
            twitter.latestTweets('chris6f', function (err, tweets) {
                assert.ifError(err);
                assert(Array.isArray(tweets) && tweets.length);
                tweets.forEach(function (tweet) {
                    assert(tweet.id);
                    assert(tweet.text);
                    assert(tweet.user);
                    assert(tweet.date.getTime() > 0);
                    assert(tweet.entities);
                });
                done();
            });
        });

    });

    describe('#latestHashtagTweets', function () {

        it('should get the latest tweets by hashtag', function (done) {
            twitter.latestHashtagTweets('yolo', function (err, tweets) {
                assert.ifError(err);
                assert(Array.isArray(tweets) && tweets.length);
                tweets.forEach(function (tweet) {
                    assert(tweet.id);
                    assert(tweet.text);
                    assert(tweet.user);
                    assert(tweet.date.getTime() > 0);
                    assert(tweet.entities);
                });
                done();
            });
        });

    });

});

