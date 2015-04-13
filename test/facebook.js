var Facebook = require('../lib/facebook').Facebook
  , test = require('tape').test;

var facebook = new Facebook();

test('get like count for url', function (t) {
    facebook.urlLikes('http://facebook.com', function (err, likes) {
        t.error(err);
        t.equal(typeof likes, 'number');
        t.assert(likes > 0);
        t.end();
    });
});

test('get the comment count for a url', function (t) {
    facebook.urlComments('http://facebook.com', function (err, comments) {
        t.error(err);
        t.equal(typeof comments, 'number');
        t.assert(comments > 0);
        t.end();
    });
});

test('fail on invalid url', function (t) {
    facebook.urlLikes('!@(*#&!(@*#&!', function (err) {
        t.assert(err);
    });
    facebook.pageLikes('!@(*#&!(@*#&!', function (err) {
        t.assert(err);
        facebook.pageLikes('http://google.com', function (err) {
            t.assert(err);
        });
    });
    t.end();
});

test('get like count for a facebook page', function (t) {
    facebook.pageLikes('https://www.facebook.com/baconaddicts', function (err, likes) {
        t.error(err);
        t.equal(typeof likes, 'number');
        t.assert(likes > 0);
        t.end();
    });
});

test('get likes for a non-vanity page', function (t) {
    facebook.pageLikes('facebook.com/pages/Bacon/113009932047080', function (err, likes) {
        t.error(err);
        t.equal(typeof likes, 'number');
        t.assert(likes > 0);
        t.end();
    });
});

test('get likes for a page id', function (t) {
    facebook.pageLikes('baconaddicts', function (err, likes) {
        t.error(err);
        t.equal(typeof likes, 'number');
        t.assert(likes > 0);
        t.end();
    });
});
