var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var mongoose = require('mongoose');
var SALT_WORK_FACTOR = 10;

var userSchema = mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, unique: true, lowercase: true, trim: true , index :true},
  password: String,
  facebook: {
    id: String,
    email: String
  },
  google: {
    id: String,
    email: String
  },
  series:[{
    type: mongoose.Schema.Types.ObjectId, ref: 'Show'
  }]
},{strict:false},{ autoIndex: false },{id : false});

/**
 * Password hash middleware.
 */

userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    cb(err, isMatch);
  });
};



var User = mongoose.model('User', userSchema);

module.exports = User;