# errorhandler-express

An advanced package for softdeleting models with mongoose (also 'find', 'findOne', 'findOneAndUpdate', 'update', 'count')

TODO: Pending add more checks, test and documentation

## Installation

The best way to install it is using **npm**

```sh
npm install k-mongoose-soft-delete --save
```

## Loading

```js
var softDelete = require('k-mongoose-soft-delete');

```

## Initialization and Usage

Basic usage (you can see how works better with [test]():

```js
mongoose.connect('mongodb://localhost/k-mongoose-soft-delete');

Resource = new mongoose.Schema({
    title: {type: String},
    second: {type: String, soft_delete_action: 'null'},
    third:  {type: String, soft_delete_action: 'prefix'}
},{timestamps:true});

Resource.plugin(softDelete);

//When you have a resource
resource.softDelete(function(err){});

```


## Support

This plugin is proudly supported by [Kubide](http://kubide.es/) [hi@kubide.es](mailto:hi@kubide.es)

