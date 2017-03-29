require('should');
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var mongooseFindCachePlugin = require('../../index')
chai.use(chaiAsPromised);

// test git merge build .........
/* global describe before it */
describe('mongoose-findCache', function () {
    var Model, RedisService;
    before(function () {
        var schema = new mongoose.Schema({
            field1: String,
            field2: Number,
            field3: Boolean,
            field4: {
                subfield1: String,
                subfield2: Number,
                subfield3: Boolean
            }
        });
        schema.plugin(mongooseFindCachePlugin());
        RedisService = require('../../redisService')();
        Model = mongoose.model('model', schema);
        return new Promise((resolve, reject) => {
            mockgoose(mongoose).then(function() {
                mongoose.connect('mongodb://localhost/findCache-plugin', function (err) {
                    Model.create(Array.apply(Array, new Array(100)).map((_, i) => {
                        return {
                            field1: "String" + i,
                            field2: i,
                            field3: i % 2 == 0,
                            field4: {
                                subfield1: "sub-String" + i,
                                subfield2: i,
                                subfield3: i % 3 == 0,
                            }
                        }
                    })).then(resolve, reject)
                });
            }).catch(err => {
            });
        });
    });
    describe('#test cases', function () {
        it('#test redisService', function () {
            var key = {xxx : 'xxx', yyy: 1};
            var value = {string : 'string', number : 111};
            return RedisService.write(key, value, 2).then(() => {
                return RedisService.read(key)
            }).then(result => {
                result.string.should.be.equal('string');
                result.number.should.be.equal(111);
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, 1000)
                })
            }).then(() => {
                return RedisService.read(key)
            }).then(result => {
                result.string.should.be.equal('string');
                result.number.should.be.equal(111);
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, 2000)
                })
            }).then(() => {
                return expect(RedisService.read(key)).to.be.rejectedWith('not found');
            }).catch(err => {
                console.log(err)
            })
        });
        it('#findCache', function () {
            var query = {
                field2: {
                    $lt: 2
                }
            };
            return Model.findCache(query, null, 2).then(result => {
                // console.log(result)
                result.length.should.be.equal(2);
                return Model.update({field1 : 'String0'}, {$set : {field1 : 'updated'}})
            }).then(result => {
                return Model.findCache(query, null, 2)
            }).then(result => {
                result[0].field1.should.be.equal('String0');
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, 2000)
                })
            }).then(result => {
                return Model.findCache(query, null, 2)
            }).then(result => {
                result[0].field1.should.be.equal('updated');
            }).catch(err => {
                console.log(err);
            })
        });

        it('#aggregateCache', function () {
            var pipelines = [
                {
                    $match : {
                        field2 : {$lt : 20}
                    }
                },
                {
                    $group : {
                        _id : "$field3",
                        sum : {
                            $sum : "$field2"
                        }
                    }
                }
            ];
            return Model.aggregateCache(pipelines, 2).then(result => {
                result.length.should.be.equal(2);
            }).then(result => {
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, 2000)
                })
            }).then(result => {
                return expect(RedisService.read(pipelines)).to.be.rejectedWith('not found');
            }).catch(err => {
                console.log(err);
            })
        });
    });
});