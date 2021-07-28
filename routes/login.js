const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

const { User, validateLogin } = require('../model/users');
const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/bodyValidator');

router.post('/', bodyValidator(validateLogin), wrapper( async (req, res) => {
    const { emailOrUsername, password } = req.body;

    const user1 = await User.findOne({ email: emailOrUsername });
    const user2 = await User.findOne({ username: emailOrUsername });

    if (!user1 && !user2) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'invalid input field'
        })
    }

    let user = user1 || user2;

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: 'invalid input field'
        })
    } else {
        const token = user.generateToken();
        res.status(200).header("x-auth-token", token).json({
            status: 200,
            message: 'success',
            data: `youre welcome ${ user.username }`
        })
    }
}));

module.exports = router;