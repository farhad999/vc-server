const router = require('express').Router();
const fileController = require('../app/controllers/file.controller');

const multer = require('multer');

const mime = require('mime-types')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        let ext = mime.extension(file.mimetype);
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

router.post('/upload', upload.array('files'), fileController.upload);

router.delete('/:fileName', fileController.remove);

module.exports = router;