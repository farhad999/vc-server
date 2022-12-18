const router = require("express").Router();
const fileController = require("../app/controllers/file.controller");

const multer = require("multer");

const mime = require("mime-types");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let { directory } = req.query;

    let destination = "";

    if (directory) {
      destination = destination + directory + "/";

      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }
    }

    cb(null, destination);
  },
  filename: function (req, file, cb) {
    let splitted = file.originalname.split(".");
    let ext = splitted[splitted.length - 1];
    cb(null, splitted[0] + "_" + Date.now() + "." + ext);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.array("files"), fileController.upload);

router.post("/upload_one", upload.single("file"), fileController.singleUpload);

router.delete("/:file", fileController.remove);

module.exports = router;
