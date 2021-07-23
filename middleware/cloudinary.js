const cloudinary = require('cloudinary').v2;
// const config = require('config');

// cloudinary.config({
//     cloud_name: config.get('cloudName'),
//     api_key: config.get('apiKey'),
//     api_secret: config.get('apiSecret')
// });

cloudinary.config({
    cloud_name: "dmqclv2qr",
    api_key: 715936618997629,
    api_secret: "1wbFEaCiVD9_tSaeKWF0SBC7J-E"
})

module.exports = cloudinary;