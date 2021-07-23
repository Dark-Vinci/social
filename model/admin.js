const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const adminModel = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 2,
        maxlegth: 30,
        unique: true
    },

    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlegth: 100,
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

    power: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
        max: 8
    }
});

adminModel.methods.generateToken = function () {
    const token = jwt.sign(
        { username: this.username, power: this.power, _id: this._id }, 
        config.get('jwtPass'),  
        { expiresIn: '100d' });
    return token;
}

const Admin = mongoose.model('Admin', adminModel);

function validate(inp) {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .min(2)
            .max(30),

        phoneNumber: Joi.string()
            .required()
            .min(11)
            .max(11),

        username: Joi.string()
            .required()
            .min(1)
            .max(30),
        
        password: Joi.string()
            .required()
            .min(10)
            .max(100)
    });

    const result = schema.validate(inp);
    return result;
}

function validatePut(inp) {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .min(2)
            .max(30),

        phoneNumber: Joi.string()
            .min(11)
            .max(11),

        username: Joi.string()
            .min(1)
            .max(30)
    });

    const result = schema.validate(inp);
    return result;
}

function validatePasswordChange(inp) {
    const schema = Joi.object({
        oldPassword: Joi.string()
            .required()
            .min(10)
            .max(100),

        newPassword: Joi.string()
            .required()
            .min(10)
            .max(100)
    });

    const result = schema.validate(inp);
    return result;
}

function validateLogin(inp) {
    const schema = Joi.object({
        emailOrUsername: Joi.string()
            .email()
            .required()
            .min(3)
            .max(100),

        password: Joi.string()
            .required()
            .min(10)
            .max(100)
    });

    const result = schema.validate(inp);
    return result;
}

module.exports.adminModel = adminModel;
module.exports.Admin = Admin;
module.exports.validate = validate;
module.exports.validatePut = validatePut;
module.exports.validatePasswordChange = validatePasswordChange;
module.exports.validateLogin = validateLogin;