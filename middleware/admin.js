
module.exports = function (req, res, next) {
    if (!req.user.power) {
        return res.status(403).json({
            status: 403,
            message: 'failure',
            data: 'unauthorized, dont try this again'
        })
    } else {
        next();
    }
}