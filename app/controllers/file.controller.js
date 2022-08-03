const fs = require("fs");
const upload = async (req, res) => {
    let files = req.files;
    res.json({
        status: 'success',
        files: files.map(file => ({name: file.filename, path: file.path.replace(/\\/g, "/")}))
    });
}

const singleUpload = async (req, res) => {
    let file = req.file;
    res.json({
        status: 'success', file: {
            name: file.filename, path: file.path.replace(/\\/g, "/"),
            size: file.size
        },
    });
}

const remove = async (req, res) => {

    let {file} = req.params;

    fs.unlink(file, (er) => {
        if (er) {
            return res.json({status: 'failed', er: er});
        }
        return res.json({status: 'success'});

    });
}

module.exports = {
    upload,
    remove,
    singleUpload
}