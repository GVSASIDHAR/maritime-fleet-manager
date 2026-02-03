const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <--- 1. Import bcrypt

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Admin', 'Operator', 'Viewer'], 
        default: 'Viewer' 
    }
}, {
    timestamps: true
});

// 2. Add the custom method to compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);