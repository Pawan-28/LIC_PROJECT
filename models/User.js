const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'नाम आवश्यक है'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'ईमेल आवश्यक है'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'कृपया एक वैध ईमेल दर्ज करें']
  },
  password: {
    type: String,
    required: [true, 'पासवर्ड आवश्यक है'],
    minlength: [8, 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए']
  },
  phone: {
    type: String,
    required: [true, 'फोन नंबर आवश्यक है'],
    trim: true,
    match: [/^[0-9]{10}$/, 'कृपया 10 अंकों का वैध फोन नंबर दर्ज करें']
  },
  gender: {
    type: String,
    required: [true, 'लिंग आवश्यक है'],
    enum: ['male', 'female', 'other']
  },
  dob: {
    type: Date,
    required: [true, 'जन्म तिथि आवश्यक है']
  },
  city: {
    type: String,
    required: [true, 'शहर आवश्यक है'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'राज्य आवश्यक है'],
    trim: true
  },
  pinCode: {
    type: String,
    required: [true, 'पिन कोड आवश्यक है'],
    match: [/^[0-9]{6}$/, 'कृपया 6 अंकों का वैध पिन कोड दर्ज करें']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('पासवर्ड की तुलना करने में त्रुटि');
  }
};

module.exports = mongoose.model('User', userSchema); 