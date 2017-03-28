

module.exports = function (redisServer) {
	return function (schema, options) {
		const RedisService = require('./redisService')(redisServer);
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
						RedisService.write(serializeString, result, timeout || 10)
							.then(writeResult => {
								resolve(result)
							}, err => {
								console.log(err)
								reject(err)
							});
					})
				})
			});
		};
	}
}