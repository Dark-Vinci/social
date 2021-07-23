const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        res.status(401).send('no token provided');
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