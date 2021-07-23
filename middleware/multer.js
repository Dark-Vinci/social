const multer = require('multer');
const path = require('path');

const toExport = multer({
    limits: { fileSize: 1024 * 1024 * 25, files: 1 },
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        // console.log(file.originalname)
        // console.log('yay')
        let ext = path.extname(file.originalname);
        if (ext !== '.jpg' && ext !== ".jpeg" && ext !== '.png') {
            cb (new Error("file type is not supported"), false);
            return;
        }

        cb(null, true);
    }
});

module.exports = toExport;