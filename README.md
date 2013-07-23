**follower** fetches data from social networks.

This library is progressively obedient, i.e. it attempts to use APIs (some that are known and others that aren't) that require the least amount of authorisation before finally resorting to OAuth.

## Basic example

Get share counts for a URL

```javacsript
var follower = require('follower');

var shares = new follower.URLShares();

shares.count('http://example.com', function (err, shares) {
    console.log(shares);
    /* { facebook_likes: 789
       , pinterest_pins: 1169
       , twitter_tweets: 143
       , google_plus_ones: 1 } */
});
```

Fetch the latest instagram media by hashtag and memoise the results

```javascript
var follower = require('follower');

//Setup a Redis connection
var cache = new follower.Cache(6379, 'localhost');

//Memoise the results for one hour
cache.setTTL(3600);

var instagram = new follower.Instagram({
    client_id: '(oauth_client_id)'
  , secret: '(oauth_secret)'
  , cache: cache
});

instagram.latestHashtagMedia('YOLO', function (err, media) {
    //...
});
```

## Documentation

The [code](https://github.com/sydneystockholm/wordpress.js/tree/master/lib) contains usage and examples.

## License (MIT)

Copyright (c) 2013 Sydney Stockholm <opensource@sydneystockholm.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

