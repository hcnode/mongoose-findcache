require('should');
var mongoose = require('mongoose');
var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);
var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var mongooseFindCachePlugin = require('../../index')
chai.use(chaiAsPromised);

// test git merge build .........
/* global describe before it */
describe('mongoose-findCache', function () {
    var Model;
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
        schema.plugin(mongooseFindCachePlugin({
            host: "localhost",
            db: 1
        }));

        Model = mongoose.model('model', schema);
        return new Promise((resolve, reject) => {
            mockgoose.prepareStorage().then(function () {
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
                console.log(err)
            });
        });
    });
    describe('#xxx', function () {
        it('#yyy', function () {
            return Model.find({
                field2: {
                    $lt: 5
                }
            }, 10 * 1000, null).then(result => {
                console.log(result)
                result.length.should.be.equal(5);
            })
        });
    });
});