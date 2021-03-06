mongoose-findcache is a plugin of mongoose, which use redis server as data cache server.

## Usages
`npm install mongoose-findcache --save`

```javascript
var mongooseFindCache = require('mongoose-findcache');
var schema = new mongoose.Schema({
	...
});
schema.plugin(mongooseFindCache({
	port: 6379,          // Redis port
	host: '127.0.0.1',   // Redis host
	password: 'auth',
	db: 0
}));
SomeModel = mongoose.model('someModel', schema);
// cache version of find method
SomeModel.findCache({_id : 'id'}, 'select fields', 10).then(data => {
	// data is fetched and cache into redis server expired after 10's
});
// cache version of aggregate method and provide promise return
SomeModel.aggregateCache([pipelines...], 3600).then(date => {
	// data is fetched and cache into redis server expired after one hour
})

```

[Test cases](https://github.com/hcnode/mongoose-findcache/blob/master/test/integration/index.test.js) for more detail

## Test
`npm test`
