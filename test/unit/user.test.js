const mongoose = require('mongoose');
const { User } = require('../../model/users');
const jwt = require('jsonwebtoken');
const config = require('config');

describe('generate web token', () => {
    it ('should generate a valid web token', () => {
        const payload = { 
            _id: mongoose.Types.ObjectId().toHexString(), 
            username: 'username'
        }
        const user = new User(payload);
        const token = user.generateToken();
        const valid = jwt.verify(token, config.get('jwtPass'));

        expect(valid).toMatchObject(payload)
    })
})