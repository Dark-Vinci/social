const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const userModel = new Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlegth: 30
    },

    lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlegth: 30
    },

    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlegth: 100,
        // match: 
    },

    password: {
        
    }
});

const User = mongoose.model('User', userModel);

module.exports.userModel = userModel;
module.exports.User = User;