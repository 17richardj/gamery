var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 bcrypt = require('bcrypt'),

userSchema = new Schema( {

	unique_id:  { type: Number, required: true, index: { unique: true } },
	email:  { type: String, required: true, index: { unique: true } },
	username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
	phone:  { type: String},
});
let SALT_WORK_FACTOR = 5
userSchema.pre('save', function(next) {
 var user = this;
 // Generate a password hash when the password changes (or a new password)
 if (!user.isModified('password')) return next();
 // Generate a salt
 bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
  if (err) return next(err);
  // Combining Salt to Generate New Hash
  bcrypt.hash(user.password, salt, function(err, hash) {
   if (err) return next(err);
   // Overwriting plaintext passwords with hash
   user.password = hash;
   next();
  });
 });
});
 userSchema.methods.comparePassword = function(candidatePassword, cb) {
 bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
  if (err) return cb(err);
  cb(null, isMatch);
 });
};

User = mongoose.model('User', userSchema);
module.exports = User;
