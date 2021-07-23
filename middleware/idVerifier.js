const mongoose = require('mongoose');
const valid = mongoose.Types.ObjectId;

module.exports = function (req, res, next) {
    const q = req.params;
    const id = q.id || q.postId || q.userId || 
        q.userToBeCheckedId || q.userToBeFollowedId || 
        q.userToBeUnFollowedId ;

    if (!valid.isValid(id)) {
        return res.status(200).json({
            status: 400,
            message: 'failure',
            data: 'invalid id paramater'
        })
    } else {
        next();
    }
}