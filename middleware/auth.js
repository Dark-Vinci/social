const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({
            status: 401,
            message: 'failure',
            data: 'no token is provided'
        })
    } else {
        try {
            const decoded = jwt.verify(token, config.get('jwtPass'));
            req.user = decoded;
            next()
        } catch (ex) {
            res.status(400).json({
                status: 400,
                message: 'failure',
                data: 'invalid token was provided'
            })
        }
    }
}