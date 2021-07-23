
module.exports = function (req, res, next) {
    if (req.user.power <= 4) {
        return res.status(403).json({
            status: 403,
            message: 'failure',
            data: 'oga go kill you bro'
        })
    } else {
        next();
    }
}