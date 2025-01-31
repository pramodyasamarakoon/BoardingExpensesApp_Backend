const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    balance: {
        type: Number,
        default: 0 
    }
})

// hash password before saving
userSchema.pre('save', async function (next) {
    if(!this.isModified('password'))  return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

// compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

module.exports = mongoose.model('User', userSchema);