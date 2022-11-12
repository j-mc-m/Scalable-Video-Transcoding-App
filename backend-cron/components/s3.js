// Imports
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
import { unlink } from 'node:fs';

// External functions
const { getS3KeyByDynamoUUID, updateDynamo } = require("./dynamo");

// AWS configuration
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
 * Given the S3 Key, download that file to /tmp
 * Update Dynamo DB status table accordingly
 */
downloadTmpFromS3 = async (dynamoUUID) => {
    const s3Key = await getS3KeyByDynamoUUID(dynamoUUID);
    const status = "starting"
    updateDynamo(dynamoUUID, status, "");

    const params = {
        Bucket: s3Ingest,
        Key: s3Key,
    }

    const { Body } = await s3.getObject(params).promise();

    const location = '/tmp/' + s3Key;
    await fs.mkdir('/tmp/' + dynamoUUID);
    await fs.writeFile(location, Body);
    return location;
}

/********
 * Given a file path, upload this file to the public S3 bucket before returning a promise containing the public URL
 * Update Dynamo DB status table accordingly
 */
async function uploadTranscodeToS3(dynamoUUID, file) {
    // Update Dynamo DB status
    const status = "uploading";
    updateDynamo(dynamoUUID, status, "");

    console.log("uploading " + file + " to s3 transcode bucket");

    // Read file
    const fileData = await fs.readFile(file);

    const params = {
        Bucket: s3Transcode,
        Key: path.basename(file),
        Body: fileData,
    }

    return new Promise((resolve, reject) => {
        s3.upload(params, function (err, result) {
            if (err) {
                reject(err);
            } else {
                // Get public URL of newly uploaded object
                const s3TranscodeUrl = result.Location;
                console.log("successfully uploaded to public s3 transcode: " + s3TranscodeUrl);

                unlink(file, (err) => {
                    if(err) reject(err);
                });

                // Update Dynamo DB status
                const status = "done";
                updateDynamo(dynamoUUID, status, s3TranscodeUrl);

                // Resolve promise with the direct link to the newly uploaded object
                resolve(s3TranscodeUrl);
            }
        });
    });
}

module.exports = { downloadTmpFromS3, uploadTranscodeToS3 };