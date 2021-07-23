const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');

const likeModel = new Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required: true
    }
});

const Like = mongoose.model('Like', likeModel);

function validateLike(inp) {
    const schema = Joi.object({
        postId: Joi.objectId()
            .required()
    });

    const result = schema.validate(inp);
    return result;
}

module.exports.likeModel = likeModel;
module.exports.Like = Like;
module.exports.validateLike = validateLike;