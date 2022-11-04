// Imports
var express = require('express');
var router = express.Router();
require('dotenv').config();
var ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
var path = require('path');

// AWS configuration
const AWS = require('aws-sdk');

// Load AWS credentials from .env
AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

// Amazon DynamoDB setup
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const dynamoName = process.env.AWS_DYNAMO_DB_QUEUE;

// Load QUT username from .env file, DynamoDB & QUT IAM roles stuff
const qut_username = process.env.QUT_USERNAME;

// Amazon S3 setup
s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Load S3 bucket names from .env
const s3Ingest = process.env.AWS_S3_INGEST;
const s3Transcode = process.env.AWS_S3_TRANSCODE;

/********
 * Update the Dynamo DB table status and/or add the transcoded URL
 */
const updateDynamo = async (dynamoID, status, s3TranscodeUrl) => {
  const s3Key = await getS3KeyByDynamoID(dynamoID);
  const params = {
    TableName: dynamoName,
    Item: {
      'qut-username': qut_username,
      id: dynamoID,
      s3Key: s3Key,
      status: status,
      s3TranscodeUrl: s3TranscodeUrl
    },
  }

  return await dynamoClient.put(params).promise();
}


/********
 * Update the Dynamo DB table status and/or add the transcoded URL
 */
const getS3KeyByDynamoID = async (dynamoID) => {
  const params = {
    TableName: dynamoName,
    Key: {
      'qut-username': qut_username,
      id: dynamoID,
    }
  }

  const data = await dynamoClient.get(params).promise();
  return data.Item.s3Key;
}


/********
 * Update the Dynamo DB table status and/or add the transcoded URL
 */
downloadTmpFromS3 = async (dynamoID, s3Key) => {
  const status = "pending download from S3"
  updateDynamo(dynamoID, status, "");

  const params = {
    Bucket: s3Ingest,
    Key: s3Key,
  }

  const { Body } = await s3.getObject(params).promise();

  const location = '/tmp/' + s3Key;
  await fs.writeFile(location, Body);
  return location;
}

/********
 * Given a file path it will upload it to the public Transcode S3 bucket with the basename as the key
 */
async function uploadTranscodeToS3(dynamoID, file) {
  // Update Dynamo DB status
  const status = "uploading to public S3";
  updateDynamo(dynamoID, status, "");

  console.log("uploading " + file + " to s3 transcode bucket");

  // Read file
  const fileData = await fs.readFile(file);

  const params = {
    Bucket: s3Transcode,
    Key: path.basename(file),
    Body: fileData,
  } 
    
  return new Promise((resolve, reject) => {
    s3.upload(params, function(err, result) {
      if(err) {
        console.log(err);
        reject(err);
      } else {
        // Get public URL of newly uploaded object
        const s3TranscodeUrl = result.Location;
        console.log("successfully uploaded to public s3 transcode: " + s3TranscodeUrl);

        // Update Dynamo DB status
        const status = "finished";
        updateDynamo(dynamoID, status, s3TranscodeUrl);

        // Resolve promise with the direct link to the newly uploaded object
        resolve(s3TranscodeUrl);
      }
    });
  });
}

/********
 * Transcode the given file before uploading to the public Transcode S3 bucket
 */
async function transcode(dynamoID, file, s3Key) {
  const newFile = "/tmp/" + s3Key + ".mkv";

  // Update Dynamo DB status
  const status = "transcoding";
  updateDynamo(dynamoID, status, "");

  console.log("ffmpeg file path: " + file);

  // Read file into ffmpeg and set its path on a Linux system
  var ffmpegExec = await new ffmpeg(file);
  ffmpegExec.setFfmpegPath("/usr/bin/ffmpeg");

  return new Promise((resolve, reject) => {
    try {
      ffmpegExec.withSize('75%').withFps(24).toFormat("matroska")
        .on("end", function () {
          console.log('file has been converted successfully');

          // Update Dynamo DB status
          const status = "transcoded";
          updateDynamo(dynamoID, status, "");

          uploadTranscodeToS3(dynamoID, newFile).then(url => {
            resolve(url);
          });
          
        })
        .on('error', function (err) {
            console.log('an error happened: ' + err.message);
            reject(err.message);
        })
        .saveToFile(newFile);

    } catch(err) {
      console.log(err);
      reject(err);
    }
  });
}

/********
 * GET home page, unused on the backend
 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/********
 * POST home page
 */
router.post('/', async function(req, res) {
  const dynamoID = req.query.dynamoID;
  if(!dynamoID) {
    res.status(400).send("No DynamoID was provided");
  }

  const s3Key = await getS3KeyByDynamoID(dynamoID);

  try {
    const tmpFile = await new Promise((resolve, reject) => {
      resolve(downloadTmpFromS3(dynamoID, s3Key)).catch((err) => reject(err));
    })

    try {
      transcode(dynamoID, tmpFile, s3Key).then(url => {
        res.status(200).send({
          s3TranscodeUrl: url
        });
      });
      
    } catch(err) {
      console.log(err);
    }

  } catch(err) {
    console.log(err);
  }
});

module.exports = router;