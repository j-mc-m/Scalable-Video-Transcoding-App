// Imports
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// External functions
const { getS3KeyByDynamoUUID, updateDynamo } = require("./dynamo");
const { uploadTranscodeToS3 } = require("./s3");

/********
 * Transcode the given file before uploading to the public Transcode S3 bucket
 * Update Dynamo DB status table accordingly
 */
 async function transcode(dynamoUUID, file, resPercentage, outputExtension) {
    // Get S3 Key/original file name + extension
    const s3Key = await getS3KeyByDynamoUUID(dynamoUUID)

    // For cases where the output extension differs from the output format name itself
    var outputFormat = outputExtension
    if(outputFormat === "mkv") {
        outputFormat = "matroska"
    }
  
    // Original file name no extension
    const fileNoExtension = path.parse(s3Key).name;
  
    // New output file name
    const newFileName = dynamoUUID + "_" + fileNoExtension + "_" + resPercentage + "." + outputExtension;
    const newFilePath = "/tmp/" + newFileName;
  
    // Update Dynamo DB status
    const status = "transcoding";
    updateDynamo(dynamoUUID, status, "");
  
    // Read file into ffmpeg and set its path on a Linux system
    var ffmpegExec = await new ffmpeg(file);
    ffmpegExec.setFfmpegPath("/usr/bin/ffmpeg");
  
    return new Promise((resolve, reject) => {
        try {
            ffmpegExec.withSize(resPercentage + '%').withFps(24).toFormat(outputFormat)
            .on("end", function () {
                console.log('file has been converted successfully');
    
                // Update Dynamo DB status
                const status = "transcoded";
                updateDynamo(dynamoUUID, status, "");
    
                uploadTranscodeToS3(dynamoUUID, newFilePath).then(url => {
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
    
        } catch(err) {
            console.log(err);
            reject(err);
        }
    });
}

module.exports = { transcode };