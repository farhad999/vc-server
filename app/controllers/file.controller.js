const fs = require("fs");
const upload = async (req, res) => {
    let files = req.files;
    res.send(files.map(file=>file.filename));
}
const remove = async (req, res) => {
    let {fileName} = req.params;

    console.log('fileName', fileName);

    fs.unlink('./uploads/'+fileName, (er)=> {
        if(er) {
            return res.json({status: 'failed', er: er});
        }
        return res.json({status: 'success'});

    });
    
}

module.exports = {
    upload,
    remove
}