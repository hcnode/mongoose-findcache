const Redis = require("ioredis");

module.exports = function (redisServer) {
	return function (schema, options) {
		const RedisService = {
			getRedis: function () {
				if (!RedisService.redis) {
					RedisService.redis = new Redis(redisServer);
				}
				return RedisService.redis;
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
				let key = this.getKey(type);
				let redis = this.getRedis();
				return new Promise(function (resolve, reject) {
					redis.multi().set(key, content).expire(key, timeout).exec(function (err) {
						if (err) {
							reject(err)
						} else {
							resolve();
						}
					});
				});
			},
			read: function (type) {
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
									resolve(result);
								}
							});
						} else {
							reject();
						}
					});

				});
			},
			remove: function (type) {
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
		/**
		 *  Attach a `findCache()` helper to the schema for
		 *  syntactic sugar
		 */
		schema.statics.findCache = function (conditions, fields, timeout) {
			if (!conditions || typeof conditions === 'function') {
				conditions = {};
			}
			var serializeString = JSON.stringify(conditions);
			return new Promise((resolve, reject) => {
				RedisService.read(serializeString).then(result => {
					resolve(result)
				}).catch(err => {
					this.find(conditions, fields).then(result => {
						RedisService.write(serializeString, result, timeout || (1000 * 10 * 60)).then(() => resolve(result), () => resolve(result));
					})
				})
			});
		};
	}
}