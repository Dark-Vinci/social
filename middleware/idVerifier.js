const mongoose = require('mongoose');
const valid = mongoose.Types.ObjectId;

module.exports = function (req, res, next) {
    const q = req.params;
    const id = q.id || q.postId || q.userId || 
        q.userToBeCheckedId || q.userToBeFollowedId || 
        q.userToBeUnFollowedId || q.blockId ;

    if (!valid.isValid(id)) {
        return res.status(404).json({
            status: 404,
            message: 'failure',
            data: 'invalid id paramater'
        })
    } else {
        next();
    }
}