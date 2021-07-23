const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();
const { User, validate } = require('../model/users');
const wrapper = require('../middleware/wrapper');


router.post('/', wrapper (async (req, res) => {
    const { error } = validate(req.body);

    if (error) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: error.details[0].message
        });
    } else {
        let { 
            firstName, lastName, 
            email, phoneNumber,
            password, username,
            description, country
        } = req.body;

        const user1 = await User.findOne({ email });
        const user2 = await User.findOne({ phoneNumber });
        const user3 = await User.findOne({ username })

        if (user1) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'theres a user with same email'
            });
        }

        if (user2) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'theres a user with same phoneNumber'
            });
        }

        if (user3) {
            return res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'theres a user with same username'
            });
        }

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        const user = new User({
            email, firstName,
            phoneNumber, lastName,
            username, description, 
            password, country
        });

        try {
            await user.save();
            const token = user.generateToken();
            const toReturn = _.pick(user, ['username'])
            res.header('x-auth-token', token).json({
                status: 200,
                message: 'success',
                data: toReturn
            });
        } catch (ex) {
            let message = '';
            
            for (field in ex.errors) {
                message += " & " + ex.errors[field].message;
            }

            res.status(400).json({
                status: 400,
                message: 'failure',
                data: message
            });
        }
    }
}));

module.exports = router;