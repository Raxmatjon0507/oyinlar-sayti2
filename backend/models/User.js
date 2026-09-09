const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username kiritish shart'],
    unique: true,
    trim: true,
    minlength: [3, 'Username kamida 3 ta belgi bo\'lishi kerak'],
    maxlength: [20, 'Username 20 ta belgidan oshmasligi kerak']
  },
  email: {
    type: String,
    required: [true, 'Email kiritish shart'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email formati noto\'g\'ri']
  },
  password: {
    type: String,
    required: [true, 'Parol kiritish shart'],
    minlength: [6, 'Parol kamida 6 ta belgi bo\'lishi kerak'],
    select: false
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  balance: {
    type: Number,
    default: 1000
  },
  bonusReceived: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
