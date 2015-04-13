var Bloglovin = require('../lib/bloglovin').Bloglovin
  , test = require('tape').test;

var bloglovin = new Bloglovin();

test('fetch a follower count using id', function (t) {
    bloglovin.followerCount(10297416, function (err, followers) {
        t.error(err);
        t.equal(typeof followers, 'number');
        t.assert(followers > 0);
        t.end();
    });
});

test('fetch a follower count using full url', function (t) {
    bloglovin.followerCount('www.bloglovin.com/blog/10297416', function (err, followers) {
        t.error(err);
        t.equal(typeof followers, 'number');
        t.assert(followers > 0);
        t.end();
    });
});

test('fail on invalid blog url', function (t) {
    bloglovin.followerCount('adsfasdfasdof', function (err) {
        t.assert(err);
        t.end();
    });
});
