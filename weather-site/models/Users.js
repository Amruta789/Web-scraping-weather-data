var mongoose = require('mongoose');
var bcrypt=require('bcrypt');
var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
};

var userSchema = new mongoose.Schema({
  username: { 
      type: String, 
      unique: true, 
      required: [true, 'Username required'], 
      maxlength: 50, minlength: 4 
    },
  password: {
      type: String, 
      required: [true, 'Password required'], 
      minlength: 8 
    },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    required: [true, 'User phone number required']
  }, 
  email: { 
    type: String, 
    validate: {
        validator: function(v) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      },
      required: [true, 'User email required'], 
      unique: true
    },
  profilePicturePath: String, //store the path to profilepic
  }, schemaOptions);
  
  userSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
  });

  userSchema.methods.comparePassword = function(plaintext, callback) {
      return callback(null, bcrypt.compareSync(plaintext, this.password));
  };
var Users = mongoose.model('Users', userSchema);
module.exports = Users;