"use stric";

var mongoose = require('mongoose'),
    softDelete = require('../.'),
    chai = require("chai"),
    should = chai.should(),
//async = require('async'),
    Resource;


/* Setup */
mongoose.set('debug', true);
mongoose.connect('mongodb://localhost:27018/k-mongoose-soft-delete');

Resource = new mongoose.Schema({
    title: {type: String},
    second: {type: String, soft_delete_action: 'null'},
    third:  {type: String, soft_delete_action: 'prefix'}
},{timestamps:true});

Resource.plugin(softDelete);
mongoose.model('Resource', Resource);

/*
 https://www.youtube.com/watch?v=--UPSacwPDA
 Am I wrong, fallin' in love with you,
 tell me am I wrong, well, fallin' in love with you
 While your other man was out there,
 cheatin' and lyin', steppin' all over you

 Uh, sweet thing
 Tell me am I wrong, holdin' on to you so tight,
 Tell me, tell me, am I wrong, holdin' on to you so tight
 If your other man come to claim you,
 he'd better be ready, ready for a long long fight
 */

/* Tests */
var title = 'Am I wrong, fallin\' in love with you!',
    second = 'tell me am I wrong, well, fallin\' in love with you',
    third = 'While your other man was out there',
    resource = {};


describe('Default plugin usage', function () {
    before(function (done) {
        mongoose.model('Resource').remove({}, function () {
            done();
        });
    });

/*    after(function (done) {
        mongoose.model('Resource').remove({}, function () {
            done();
        });
    });
*/
    it('Create a new resource', function (done) {
        mongoose.model('Resource').create({
            title: title,
            second : second,
            third: third
        }, function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.have.property('title').and.equal(title);
            done();
        });
    });

    it('Check the resource is in the lists', function (done) {
        mongoose.model('Resource').find({
            title: title
        }).exec(function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.be.an('array')
                .with.deep.property(0)
                .that.have.property("title",title);

            resource = doc[0];
            done();
        });
    });

    it('Softdelete the resource', async function () {
        const result = await resource.softDelete();
        should.not.exist(result);
        resource.should.have.property('deleted').and.equal(true);
        resource.should.have.property('second').and.equal(null);
        resource.should.have.property('third').and.not.equal(third);
    });


    it('Don\'t find the resource', function (done) {
        mongoose.model('Resource').find({
            title: title
        }).exec(function (err, doc) {
            should.not.exist(err);
            should.exist(doc);
            doc.should.be.an('array').with.length(0);
            done();
        });
    });

});
