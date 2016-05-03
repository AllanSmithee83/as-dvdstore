var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConf = require('../config/passport');
var Cart = require('../models/cart');
var async = require('async');



router.get('/login', function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('accounts/login', { message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  
  //enable req.flash
  failureFlash: true
}));

router.get('/profile', passportConf.isAuthenticated, function(req, res, next) {
  User
    .findOne({ _id: req.user._id })
    .populate('history.item')
    .exec(function(err, foundUser) {
      if (err) return next(err);
		//rednder the page with object user
      res.render('accounts/profile', { user: foundUser });
    });
});


router.get('/signup', function(req, res, next) {
  res.render('accounts/signup', {
    errors: req.flash('errors')
  });
});

router.post('/signup', function(req, res, next) {
//when the user signup we save the User and call second function using callback
//then we pass user object as the parameter
  async.waterfall([
    function(callback) {
      var user = new User();

      user.profile.name = req.body.name;
      user.email = req.body.email;
      user.password = req.body.password;
      user.profile.picture = user.gravatar();

      User.findOne({ email: req.body.email }, function(err, existingUser) {

        if (existingUser) {
          req.flash('errors', 'Account with that email address already exists');
          return res.redirect('/signup');
        } else {
          user.save(function(err, user) {
            if (err) return next(err);
            callback(null, user);
          });
        }
      });
    },

		//create new Cart object and store User.id in cart.owner
		//every cart belongs only to one user
    function(user) {
      var cart = new Cart();
      cart.owner = user._id;
      cart.save(function(err) {
        if (err) return next(err);
		//login user will have sesson for server and cookie for browser
        req.logIn(user, function(err) {
          if (err) return next(err);
          res.redirect('/profile');
        });
      });
    }
  ]);
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/edit-profile', function(req, res, next) {
  res.render('accounts/edit-profile', { message: req.flash('success')});
});

router.post('/edit-profile', function(req, res, next) {
  User.findOne({ _id: req.user._id }, function(err, user) {

    if (err) return next(err);

    if (req.body.name) user.profile.name = req.body.name;
    if (req.body.address) user.address = req.body.address;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Successfully Edited your profile');
      return res.redirect('/profile');
    });
  });
});


//https://github.com/jaredhanson/passport-facebook

//send user to facebook to do autentication
//if we do give our middleware any name by default will be 'facebook'
//if we want email as one of the information from facebook we need to use scope
router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email'}));

//after facebook autenticate user, we want to redirect user to
router.get('/auth/facebook/callback', passport.authenticate('facebook', { 
	successRedirect : '/profile',
	failureRedirect : '/login'
}));






module.exports = router;
