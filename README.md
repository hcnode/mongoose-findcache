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
    SomeModel.findCache({_id : 'id'}, 'select fields', 10).then(data => {
    	// data is fetched and cache into redis server expired after 10's
    });
```

Test cases for more detail

## Test
`npm test`