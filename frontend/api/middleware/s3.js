// Imports
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const AWS = require('aws-sdk');

// Load AWS credentials from .env
AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
});

// Load S3 bucket names from .env
const s3Ingest = process.env.AWS_S3_INGEST;
const s3Transcode = process.env.AWS_S3_TRANSCODE;

// Amazon S3 setup
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

/********
 * Given a file path, upload this file to the public S3 bucket before returning a promise containing the private URL
 */
async function uploadToS3Standalone(folder, fileUUID, file) {
    console.log("uploading " + file + " to s3 ingest bucket");
    // Read file
    const fileData = await fs.readFile(folder + file);

    const params = {
        Bucket: s3Ingest,
        Key: fileUUID + '/' + path.basename(file),
        Body: fileData,
    }

    return new Promise((resolve, reject) => {
        s3.upload(params, function (err, result) {
            if (err) {
                reject(err);
            } else {
                // Get public URL of newly uploaded object
                const s3TranscodeUrl = result.Location;
                console.log("successfully uploaded to public s3 ingest: " + s3TranscodeUrl);
                // Resolve promise with the direct link to the newly uploaded object
                resolve(s3TranscodeUrl);
            }
        });
    });
}

module.exports = { uploadToS3Standalone };