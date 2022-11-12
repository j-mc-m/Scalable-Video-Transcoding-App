// Imports
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const probe = require('node-ffprobe')
const ffprobeInstaller = require('@ffprobe-installer/ffprobe')
const fs = require('fs');

// External functions
const { getS3KeyByDynamoUUID, updateDynamo } = require("./dynamo");
const { uploadTranscodeToS3 } = require("./s3");

/********
 * Get and return video duration
 */
getDuration = async (fileName) => {
    await probe(fileName).then((probeData) => {
        console.log(probeData)
        return probeData
    });
}

/********
 * Transcode the given file before uploading to the public Transcode S3 bucket
 * Update Dynamo DB status table accordingly
 */
async function transcode(dynamoUUID, fileName, resPercentage, outputExtension) {
    // Get S3 Key/original file name + extension
    const s3Key = await getS3KeyByDynamoUUID(dynamoUUID)

    // For cases where the output extension differs from the output format name itself
    var outputFormat = outputExtension
    if (outputFormat === "mkv") {
        outputFormat = "matroska"
    }


    const fileDuration = await new Promise((resolve, reject) => {
        resolve(getDuration(fileName)).catch((err) => reject(err));
    });

    console.log(fileDuration)


    // Original file name no extension
    const fileNoExtension = path.parse(s3Key).name;

    // New output file name
    const newFileName = dynamoUUID + "_" + fileNoExtension + "_" + resPercentage + "." + outputExtension;
    const newFilePath = "/tmp/" + newFileName;

    // Update Dynamo DB status
    const status = "transcoding";
    updateDynamo(dynamoUUID, status, "");

    // Read file into ffmpeg and set its path on a Linux system
    var ffmpegExec = await new ffmpeg(fileName);
    ffmpegExec.setFfmpegPath("/usr/bin/ffmpeg");

    return new Promise((resolve, reject) => {
        try {
            ffmpegExec.withSize(resPercentage + '%')
                .withFps(24)
                .toFormat(outputFormat)
                .on("end", function () {
                    console.log('file has been converted successfully');

                    // Update Dynamo DB status
                    const status = "transcoded";
                    updateDynamo(dynamoUUID, status, "");

                    uploadTranscodeToS3(dynamoUUID, newFilePath).then(url => {
                        fs.unlinkSync(fileName); // delete the original file
                        fs.unlinkSync(newFilePath); // delete the transcoded file
                        fs.rmdirSync('/tmp/' + dynamoUUID); // delete the temp directory
                        resolve(url);
                    });
                })
                .on('error', function (err) {
                    console.log('an error happened: ' + err.message);
                    const status = "failed";
                    updateDynamo(dynamoUUID, status, "");
                    reject(err.message);
                })
                .saveToFile(newFilePath);

        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

module.exports = { transcode };