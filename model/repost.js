const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');

const repostModel = new Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post'
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

const Repost = mongoose.model('Repost', repostModel);

function validateRepost(inp) {
    const schema = Joi.object({
        postId: Joi.objectId()
            .required()
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    Repost,
    repostModel,
    validateRepost
}
