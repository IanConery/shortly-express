var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link');

var User = db.Model.extend({
  tableName: 'users',
  /*links: function(){
    return this.hasMany(Link);
  },*/
  initialize: function(){
    this.on('creating', function(model, attrs, options){
      console.log('hello from the model')
      bcrypt.genSalt(8, function(err, salt){
        if(err){console.log('initialize error')}
        bcrypt.hash(attrs.password, salt,null, function(err, hash){
          if(err){console.log('BCRYPT ERROR')}
          console.log('INSIDE INIT' + '\n' + model, attrs, options)
          model.set('password', hash);
        });
      });
    });
  }
});

module.exports = User;




// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   clicks: function() {
//     return this.hasMany(Click);
//   },
//   initialize: function(){
//     this.on('creating', function(model, attrs, options){
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });