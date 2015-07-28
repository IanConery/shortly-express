var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var url = require('url');
var bcrypt = require('bcrypt-nodejs');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser('shhhh, very secret'));
app.use(session());
app.use(express.static(__dirname + '/public'));


var restrict = function (req, res, next) {
  console.log(req.url);
  var path = req.url;
  if(req.session.user){
    res.redirect(path);
  }else{
    res.render('login');
  }
}

app.get('/', 
function(req, res) {
  if(req.session.user){
    res.render('index');
  }else{
    res.redirect('/login');
  }
});

app.get('/create', 
function(req, res) {
  if(req.session.user){
    res.render('index');
  }else{
    res.redirect('/login');
  }
});

app.get('/links',
function(req, res) {
  if(req.session.user){
    Links.reset().fetch().then(function(links) {
      res.send(200, links.models);
    });
  }else{
    res.redirect('/login');
  }
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) { //tried {withRelated: ['user_id']} in fetch but didn't work
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
          // user_id: user.get('id')
        });
        //   } else {
        //     res.redirect('/');
        //   }
          
        // });
        
        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

 
app.get('/login', function(req, res) {
  if(req.session.user){
    res.redirect('/');
  }else{
    res.render('login');
  }
});

app.post('/login', function(request, response) {
 
    var username = request.body.username;
    var password = request.body.password;
    var passVal = false;

    new User({username: username}).fetch().then(function(found){
      if (found) {
        console.log(password, found.attributes.password);
        if(util.decryptPassword(password,found.attributes.password)){
          request.session.user = username;
          response.redirect('/');
        } else {
          console.log('incorrect login')
          response.redirect('/signup');
        }
      } else {
        console.log('incorrect login')
        response.redirect('/signup');
      }
    });   
});
 
app.get('/logout', function(request, response){
    request.session.destroy(function(){
        response.redirect('/');
    });
});
 
app.get('/signup', function(request, response){
  response.render('signup');
});

app.post('/signup', function(req, res) {

  var username = req.body.username;
  var password = req.body.password;
  
  new User({username: username}).fetch().then(function(found){
    if (found) {
      console.log('Ohh no you didnt')
      res.send(200, found.attributes);
    } else {
      var user = new User({
          username: username,
          password: util.encryptPassword(password)
        });


      user.save().then(function(newUser) {
        Users.add(newUser);
        res.redirect('/login');
        res.end();
      });
    }
  });
 
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);




