


module.exports = function (validator) {
    return (req, res, next) => {
        const { error } = validator(req.body);

        if (error) {
            return res.status(400).json({
                status: 400,
                message: "failure", 
                data: error.details[0].message
            })
        } else {
            next();
        }
    }
}