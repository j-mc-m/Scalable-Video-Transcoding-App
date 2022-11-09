const express = require('express');
const router = express.Router();
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const tempFileDirectory = __dirname + '/../tmp/';
const uploadPath = __dirname + '/../uploads/';

router.use(fileUpload({
    limits: { fileSize: 104857600, files: 1 }, // 100 MiB
    //createParentPath: true,
    useTempFiles: true,
    safeFileNames: true,
    abortOnLimit: true,
    preserveExtension: 4,
    tempFileDir: tempFileDirectory,
    debug: true
}));

router.post('/', function (req, res, next) {


    try {
        if (!req.files) {
            res.send({ status: false, message: 'No file uploaded' });
        } else {
            let video = req.files.video;
            const filePath = uploadPath + video.name;
            const extensionName = path.extname(video.name);
            console.log(filePath);
            //video.mv(filePath);

            const allowedExtension = ['.gif', '.mp4', '.mpeg', '.ogg', '.webm', '.mkv', '.avi', '.flv', '.mov', '.m4v'];
            const allowedMimes = ['image/gif', 'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm', 'video/x-matroska', 'video/x-msvideo', 'video/x-flv', 'video/quicktime', 'video/x-m4v'];
            if (!allowedExtension.includes(extensionName) || !allowedMimes.includes(video.mimetype)) {
                //fs.unlinkSync(filePath);
                return res.status(422).json({ status: false, message: "Invalid Video format" });
            }

            console.log("format/ext validation passed");

            // TODO: upload to S3
            //fs.unlinkSync(filePath);

            //send response
            res.send({
                status: true,
                message: 'File uploaded',
                data: {
                    name: video.name,
                    mimetype: video.mimetype,
                    size: video.size,
                    convertTo: req.body.format,
                    id: "soon",
                }
            });
        }
    } catch (err) {
        res.status(500).json({ status: false, message: err });
    }



});

module.exports = router;
