const Redis = require("ioredis");
module.exports = function(redisConfig){
	return {
		getRedis: function () {
			if (!this.redis) {
				this.redis = new Redis(redisConfig);
			}
			return this.redis;
		},
		getKey: function (type) {
			return "p_redis:" + type;
		},
		exists: function (type) {
			let key = this.getKey(type);
			let redis = this.getRedis();
			return new Promise(function (resolve, reject) {
				redis.ttl(key, (err, time) => {
					if (err) {
						reject(err);
					} else if (time > -1) {
						resolve(result);
					} else if (time == -1) {
						reject("no time");
					} else if (time == -2) {
						reject("no key");
					}
				});
			});
		},
		write: function (type, content, timeout) {
			if(typeof type == 'object') type = JSON.stringify(type);
			if(typeof content == 'object') content = JSON.stringify(content);
			let key = this.getKey(type);
			let redis = this.getRedis();
			redis.set(key, content, 'EX', timeout || 10)
			return Promise.resolve();
		},
		read: function (type) {
			if(typeof type == 'object') type = JSON.stringify(type);
			if(typeof content == 'object') content = JSON.stringify(content);
			let key = this.getKey(type);
			let redis = this.getRedis();
			return new Promise(function (resolve, reject) {
				redis.exists(key, function (err, isExits) {
					if (err) {
						reject(err);
					}
					if (isExits) {
						redis.get(key, (err, result) => {
							if (err) {
								reject(err);
							} else {
								try{
									resolve(JSON.parse(result))
								}catch(e){
									resolve(result);
								}
							}
						});
					} else {
						reject('not found');
					}
				});

			});
		},
		remove: function (type) {
			if(typeof type == 'object') type = JSON.stringify(type);
			if(typeof content == 'object') content = JSON.stringify(content);
			let key = this.getKey(type);
			let redis = this.getRedis();
			return new Promise(function (resolve, reject) {
				redis.del(key, function (err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			});
		}
	}
}