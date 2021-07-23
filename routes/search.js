const express = require('express');
const Joi = require('joi');

const router = express.Router();

const { Post } = require('../model/post');
const { User } = require('../model/users');
const wrapper = require('../middleware/wrapper');

router.post('/', wrapper (async (req, res) => {
    const { error } = validate(req.body);

    if (error) {
        return res.status(400).json({
            status: 400,
            message: 'failure',
            data: error.details[0].message
        })
    }
    
    const { searchParams } = req.body;
    const regexString = `.*${ searchParams }.*`;

    const userResult = await User.find()
        .or([{ firstName: { $regex: regexString } }, 
            { lastName:  { $regex: regexString } }, 
            { userName: { $regex: regexString } }]
        ).select({ username: 1 });

    const postResult = await Post.find({ content:  { $regex: regexString } })
        .sort('-postedAt');

    const toReturn = { userResult, postResult }

    res.status(200).json({
        status: 200,
        message: 'success',
        data: toReturn
    })
}));

function validate (inp) {
    const schema = Joi.object({
        searchParams: Joi.string()
            .required()
            .min(1)
            .max(50)
    });
    const result = schema.validate(inp);
    return result;
}

module.exports = router;