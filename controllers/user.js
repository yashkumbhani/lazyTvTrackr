var crypto = require('crypto');
var passport = require('passport');
var User = require('../models/User');




/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
  
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/login');
    }

    
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Success! You are logged in.' });
    
      res.redirect(req.session.returnTo || '/home');
    });
  })(req, res, next);
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = function(req, res, next) {

  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
 // req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail();
  var errors = req.validationErrors();

  if (errors) {
    return res.redirect('/signup');
  }

  var user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      return res.redirect('/signup');
    }
    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = function(req, res) {
  
  if (req.user || req.session.userid) {
    return res.redirect('/');
  }
  res.render('./register.html', {
    title: 'Create Account'
  });
};

exports.getLogin = function(req, res) {
 
  if (req.user) {
    return res.redirect('/home');
  }
  res.render('./login.html');
};

exports.logout = function(req, res) {
  req.logout();
 req.session.destroy(function(err) {
            // if you don't want destroy the whole session, 
            //because you anyway get a new one you also could just change the flags and remove the private informations
            // req.session.user.save(callback(err, user)) // didn't checked this
            //delete req.session.user;  // remove credentials
            //req.session.authenticated = false; // set flag
          res.clearCookie('connect.sid', { path: '/' }); // see comments above          
          res.send('removed session', 200); // tell the client everything went well
         //S res.redirect('/');
       });

};
