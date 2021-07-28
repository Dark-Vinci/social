const cloudinary = require('cloudinary').v2;
// const config = require('config');

// cloudinary.config({
//     cloud_name: config.get('cloudName'),
//     api_key: config.get('apiKey'),
//     api_secret: config.get('apiSecret')
// });

cloudinary.config({
    cloud_name: "ajkiscgme",
    api_key: 1234567890,
    api_secret: "7wbDEcCiVj0_mSadKWF9SBC1J-l"
})

module.exports = cloudinary;