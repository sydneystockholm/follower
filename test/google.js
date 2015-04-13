var Google = require('../lib/google').Google
  , test = require('tape').test;

var google = new Google();

test('get plus count for url', function (t) {
    google.urlPlusOnes('http://google.com', function (err, plus_ones) {
        t.error(err);
        t.assert(typeof plus_ones === 'number');
        t.assert(plus_ones > 0);
        t.end();
    });
});

test('fail on invalid url', function (t) {
    google.urlPlusOnes(')(A*SD()AS*D)(@!', function (err) {
        t.assert(err);
        t.end();
    });
});
