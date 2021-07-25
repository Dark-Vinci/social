const mongoose = require('mongoose');
const { Admin } = require('../../model/admin');
const jwt = require('jsonwebtoken');
const config = require('config');

describe('generate web token', () => {
    it ('should generate a valid web token', () => {
        const payload = { 
            _id: mongoose.Types.ObjectId().toHexString(), 
            username: 'username',
            power: 2
        }
        const admin = new Admin(payload);
        const token = admin.generateToken();
        const valid = jwt.verify(token, config.get('jwtPass'));

        expect(valid).toMatchObject(payload)
    })
})