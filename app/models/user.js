var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link');

var User = db.Model.extend({
  tableName: 'users',
  links: function(){
    return this.hasMany(Link);
  }
  /*initialize: function(){
    this.on('creating', function(model, attrs, options){
      bcrypt.genSaltSync(8, function(err, salt){
        if(err){console.log('initialize error')}
        bcrypt.hash(attrs.password, salt,null, function(err, hash){
          console.log(attrs.password);
          if(err){console.log('BCRYPT ERROR')}
          model.set({password: hash});
            console.log('user: ',model.get('username'));
            console.log('password: ',model.get('password'));
        });
      });
  */  // var salt = bcrypt.genSaltSync(10);
    // var hash = bcrypt.hashSync(model.password/*, salt);
    // console.log(hash);
    // model.set({password: hash});
    //});
  //}*/
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