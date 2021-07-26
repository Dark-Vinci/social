const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');

const postModel = new Schema({
    content: {
        type: String,
        required: true,
        minlength: 1,
        maxlegth: 200
    },

    comments: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Post'
    },

    postedBy: {
        type:  mongoose.Schema.Types.ObjectId ,
        ref: 'User',
        required: true
    },

    postedAt: {
        type: Date,
        default: Date.now,
        required: true
    },

    likedBy: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'User'
    },

    repostedBy: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'User'
    }
});

const Post = mongoose.model('Post', postModel);

function validatePost(inp) {
    const schema = Joi.object({
        content: Joi.string()
            .required()
            .min(1)
            .max(200)
    });

    const result = schema.validate(inp);
    return result;
}

function validateRepost(inp) {
    const schema = Joi.object({
        userId: Joi.objectId()
            .required()
    });

    const result = schema.validate(inp);
    return result;
}

function validateLike(inp) {
    const schema = Joi.object({
        userId: Joi.objectId()
            .required()
    });

    const result = schema.validate(inp);
    return result;
}

function validateComment(inp) {
    const schema = Joi.object({
        commentId: Joi.objectId()
            .required()
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    Post,
    postModel,
    validatePost,
    validateRepost,
    validateLike,
    validateComment
}
