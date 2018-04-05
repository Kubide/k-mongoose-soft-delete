"use strict";
let _ = require('lodash'),
    shortId  = require('shortid');

module.exports = function(schema) {
    // Not apply hash in childSchemas
    if(schema.options.__isChildSchema !== true) {

      // Calculate if has ChildSchemas to no apply hash
      _.forEach(schema.childSchemas, function (childSchema) {
        childSchema.schema.options.__isChildSchema = true;
      });

      schema.statics.SOFT_DELETE = 1;
      schema.add({deleted: {type: Boolean, 'default': false, select: false, index: true}});
      schema.add({deletedAt: {type: Date, 'default': null, select: false}});

      schema.pre('save', function (next) {
        var doc = this;

        if (!doc.deleted) {
          doc.deleted = false;
          doc.deletedAt = null;
        }

        next();
      });

      // All mongoose queries are built using these base queries,
      // therefore adding the `archived` and `removed` logic to these queries adds it to all queries.
      let queries = ['find', 'findOne', 'findOneAndUpdate', 'update', 'count'];

      // add pre-query logic
      queries.forEach(function (query) {
        schema.pre(query, function (next) {
          // Only query documents that do not have the removed flag set to true.
          // Setting {deleted: {$ne: null}} overrides this and only queries removed documents.

          // TODO how to show deleted?
          this.where({
            deleted: {
              '$eq': false
            }
          });

          next();
        });
      });
    }

    let soft_delete_fields = [];

    schema.eachPath(function (pathname, schemaType) {

        if (schemaType.instance == "String" && schemaType.options && schemaType.options.soft_delete_action) {
            var field = {
                "name": pathname
            };

            if (typeof(schemaType.options.soft_delete_action) === "string") {
                field.action = schemaType.options.soft_delete_action;
            } else  {
                field.action = null;
            }

            soft_delete_fields.push(field);
        }
    });

    schema.methods.softDelete = function(callback) {
        var doc = this;

        doc.email = shortId() + '_' + doc.email;
        doc.deleted = true;
        doc.deletedAt = new Date();

        _.forEach(soft_delete_fields, function (field) {
            switch (field.action) {
                case "null":
                case null:
                    doc[field.name] = null;
                    break;
                case "suffix":
                    doc[field.name] += "-" + shortId();
                    break;
                case "prefix":
                    doc[field.name] = shortId() + "-" + doc[field.name];
                    break;
                case "replace":
                    doc[field.name] = shortId() + "-" + shortId() + "-" + shortId();
                    break;
            }
        });


        doc.save(callback);
    };

    schema.methods.restore = function(callback) {
        this.deleted = null;
        this.save(callback);
    };

    let removeFields = function (doc, ret, options) {
        if (!ret.deleted) {
            delete ret.deleted;
            delete ret.deletedAt;
        }

        return ret;
    };

    schema.set('toJSON', {
        transform: removeFields
    });

    schema.set('toObject', {
        transform: removeFields
    });

};