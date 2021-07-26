const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const blockSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },

    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Admin'
    },

    blockedAt: {
        type: Date,
        default: Date.now,
        required: true
    },

    reason: {
        type: String,
        required: true,
        default: 'spam',
        enum: ['spam', 'abuse', 'others']
    },

    unblockedBy: {
        type: mongoose.Schema.Types.ObjectId
    },

    unblockedAt: {
        type: Date
    },

    unblocked: {
        type: Boolean,
        default: false
    }
});

blockSchema.statics.onceBlocked = function () {
    const result = this.find({ unblocked: true });
    return result;
}

blockSchema.statics.stillBlocked = function () {
    const result = this.find({ unblocked: false });
    return result;
}

const Blocked = mongoose.model('Blocked', blockSchema);

module.exports = {
    Blocked,
    blockSchema
}