const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const slugify = require('slugify');

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
        maxlegth: 300,
        unique: true
    },

    password: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1024
    },

    phoneNumber: {
        type: String,
        required: true,
        minlength: 11,
        maxlength: 11,
        unique: true
    },

    country: {
        type: String,
        // required: true,
        minlength: 3,
        maxlength: 50
    },

    description: {
        type: String,
        minlength: 0,
        maxlength: 100
    },

    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    },

    post: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Post'
    },

    followers: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'User'
    },

    following: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'User'
    },

    comment: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Post'
    },

    likedPost: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Post'
    },

    repost: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Post'
    },

    username: {
        type: String,
        required: true,
        unique: true,
        min: 1,
        max: 50,
        trim: true
    },

    avatar: {
        type: String,
        minlength: 10
    },

    avatarKey: {
        type: String,
        minlength: 10
    }
});

// userModel.pre('validate', function (next) {
//     if (this.username) {
//         this.username = slugify(this.username, {
//             strict: true,
//             replacement: '*'
//         })
//     }

//     next();
// });

userModel.methods.generateToken = function () {
    const token = jwt.sign(
        { username: this.username, _id: this._id }, 
        config.get('jwtPass'), 
        { expiresIn: '100d' });
    return token;
}

const User = mongoose.model('User', userModel);

function validate(inp) {
    const schema = Joi.object({
        firstName: Joi.string()
            .required()
            .min(2)
            .max(30),

        lastName: Joi.string()
            .required()
            .min(2)
            .max(30),

        email: Joi.string()
            .email()
            .required()
            .min(2)
            .max(300),

        phoneNumber: Joi.string()
            .required()
            .min(11)
            .max(11),

        password: Joi.string()
            .required()
            .min(7)
            .max(100),

        description: Joi.string()
            .max(100),

        username: Joi.string()
            .required()
            .min(1)
            .max(30),
        
        country: Joi.string()
            .required()
            .min(3)
            .max(50),

        avatar: Joi.string()
            .max(200),

        avatarKey: Joi.string()
            .max(200),
    });

    const result = schema.validate(inp);
    return result;
}

function validateLogin(inp) {
    const schema = Joi.object({
        emailOrUsername: Joi.string()
            .required()
            .min(1)
            .max(300),

        password: Joi.string()
            .required()
            .min(7)
            .max(100)
    });

    const result = schema.validate(inp);
    return result;
}

function validateChangePassword(inp) {
    const schema = Joi.object({
        oldPassword: Joi.string()
            .required()
            .min(7)
            .max(100),

        newPassword: Joi.string()
            .required()
            .min(7)
            .max(100)
    });

    const result = schema.validate(inp);
    return result;
}

function validateChangeProfile(inp) {
    const schema = Joi.object({
        firstName: Joi.string()
            .min(2)
            .max(30),

        lastName: Joi.string()
            .min(2)
            .max(30),

        email: Joi.string()
            .email()
            .min(2)
            .max(300),

        phoneNumber: Joi.string()
            .min(11)
            .max(11),

        description: Joi.string()
            .max(100)
    });

    const result = schema.validate(inp);
    return result;
}

function validatePost(inp) {
    const schema = Joi.object({
        postId: Joi.objectId()
            .required()
    });

    const result = schema.validate(inp);
    return result;
}

function validateFollow(inp) {
    const schema = Joi.object({
        userToBeFollowed: Joi.objectId()
            .required()
    });

    const result = schema.validate(inp);
    return result;
}

module.exports.userModel = userModel;
module.exports.User = User;
module.exports.validate = validate;
module.exports.validateLogin = validateLogin;
module.exports.validateChangePassword = validateChangePassword;
module.exports.validateChangeProfile = validateChangeProfile;
module.exports.validatePost = validatePost;
module.exports.validateFollow = validateFollow;