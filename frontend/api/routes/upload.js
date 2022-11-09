const express = require('express');
const router = express.Router();
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const crypto = require('node:crypto');
require('dotenv').config();
const { addToDynamo } = require("../middleware/dynamo");
const { uploadToS3Standalone } = require("../middleware/s3");

const tempFileDirectory = __dirname + '/../tmp/';
const uploadPath = __dirname + '/../uploads/';

router.use(fileUpload({
    limits: { fileSize: 104857600, files: 1 }, // 100 MiB
    createParentPath: true,
    useTempFiles: true,
    safeFileNames: true,
    abortOnLimit: true,
    preserveExtension: 4,
    tempFileDir: tempFileDirectory,
    debug: true
}));

router.post('/', function (req, res, next) {
    //try {
    if (!req.files) {
        res.send({ status: false, message: 'No file uploaded' });
    } else {
        let video = req.files.video;
        const fileUUID = crypto.randomUUID().toUpperCase();
        const filePath = uploadPath + fileUUID + '/' + video.name;
        const extensionName = path.extname(video.name);
        video.mv(filePath);

        const allowedExtension = ['.gif', '.mp4', '.mpeg', '.ogg', '.webm', '.mkv', '.avi', '.flv', '.mov', '.m4v'];
        const allowedMimes = ['image/gif', 'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm', 'video/x-matroska', 'video/x-msvideo', 'video/x-flv', 'video/quicktime', 'video/x-m4v'];
        if (!allowedExtension.includes(extensionName) || !allowedMimes.includes(video.mimetype) || !allowedExtension.includes('.' + req.body.format)) {
            fs.rmSync(uploadPath + fileUUID + '/', { recursive: true });
            return res.status(422).json({ status: false, message: "Invalid Video format" });
        }


        // upload to S3
        uploadToS3Standalone(uploadPath + fileUUID + '/', fileUUID, video.name)
            .then((data) => {
                console.log(data);

                // here we will add to dynamodb
                addToDynamo(fileUUID, fileUUID + '/' + video.name, 'pending', req.body.format)
                    .then((data) => {
                        console.log(data);
                        //send response
                        res.status(200).json({
                            status: true,
                            message: 'File uploaded',
                            data: {
                                name: video.name,
                                mimetype: video.mimetype,
                                size: video.size,
                                convertTo: req.body.format,
                                id: fileUUID
                            }
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({ status: false, message: 'Saving to database failed' });
                        // TODO: potentially delete the file from s3 ?   nice to have
                    });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ status: false, message: 'File upload to S3 failed' });
            })
            .finally(() => {
                fs.rmSync(uploadPath + fileUUID + '/', { recursive: true });
            });

    }
    //} catch (err) {
    //    res.status(500).json({ status: false, message: err });
    //}
});

module.exports = router;
