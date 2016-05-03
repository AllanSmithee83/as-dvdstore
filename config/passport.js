var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require ('../config/secret');
var User = require('../models/user');
var Cart = require('../models/cart');
var async = require('async');

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


//Middleware
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  User.findOne({ email: email}, function(err, user) {
    if (err) return done(err);

    if (!user) {
      return done(null, false, req.flash('loginMessage', 'No user has been found'));
    }

    if (!user.comparePassword(password)) {
      return done(null, false, req.flash('loginMessage', 'Oops! Wrong Password pal'));
    }
    return done(null, user);
  });
}));

//https://github.com/jaredhanson/passport-facebook
passport.use(new FacebookStrategy(secret.facebook,
  function(token, refreshToken, profile, done) {
				//declate to user models
    User.findOne({ facebook: profile.id }, function (err, user) {
     if(err) return done(err);
	 if (user) {
		 return done(null, user);
	}else{
		
		//create new user object , save, then call callback newUser object
		async.waterfall([
		function (callback){
			var newUser = new User();
			newUser.email= profile._json.email;
			newUser.facebook= profile.id;
			newUser.tokens.push({kind: 'facebook', token:token});
			newUser.profile.name= profile.displayName;
			newUser.profile.picture= 'https://graph.facebook.com/'+profile.id+ '/picture?type=large';

			newUser.save(function(err, user){
				if(err)throw err;	
			
			callback (err, newUser);
		});
		
		},
		//create new cart object and set it to newUser._id
		function (newUser){
			var cart = new Cart();
			cart.owner= newUser._id;
			cart.save(function(err){
				if(err) return done (err);
				return done (err, newUser)
			});
			
		}])
			
			
		
		}	
		});
  }));



//custom function to validate
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
