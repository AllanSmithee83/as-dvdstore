var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;

/* The user schema attributes / characteristics / fields */
//create our bare bones representation of a user
//http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt

var UserSchema = new Schema({

  email: { type: String, unique: true, lowercase: true},
  password: String,
  
  facebook: String,
  tokens: Array,

  profile: {
    name: { type: String, default: ''},
    picture: { type: String, default: ''}
  },

  address: String,
  history: [{
    date: Date,
    paid: { type: Number, default: 0},
    item: { type: Schema.Types.ObjectId, ref: 'Dvd'}
  }]
});

	/* //Keeping Track of Failed Login Attempts and Account Locks
	  loginAttempts: { type: Number, required: true, default: 0 },
	  lockUntil: { type: Number }
	});

	UserSchema.virtual('isLocked').get(function() {
		// check for a future lockUntil timestamp
		return !!(this.lockUntil && this.lockUntil > Date.now());
	});  /*

/*  Hash the password before we even save it to the database */
UserSchema.pre('save', function(next) {
  var user = this;
  
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  
  // generate a salt
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
	
	    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
	  
	  // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

/* compare password in the database and the one that the user type in */
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

//adding unique avatar picture to new every user / gravatar
UserSchema.methods.gravatar = function(size) {
  if (!this.size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}
/*
	UserSchema.methods.incLoginAttempts = function(cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.update(updates, cb);
};

// expose enum on the model, and provide an internal convenience reference 
var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

UserSchema.statics.getAuthenticated = function(username, password, cb) {
    this.findOne({ username: username }, function(err, user) {
        if (err) return cb(err);

        // make sure the user exists
        if (!user) {
            return cb(null, null, reasons.NOT_FOUND);
        }

        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // test for a matching password
        user.comparePassword(password, function(err, isMatch) {
            if (err) return cb(err);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return user.update(updates, function(err) {
                    if (err) return cb(err);
                    return cb(null, user);
                });
            }

            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });


*/

module.exports = mongoose.model('User', UserSchema);
