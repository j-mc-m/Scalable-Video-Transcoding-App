var express = require('express');
var router = express.Router();
require('dotenv').config();
var ffmpeg = require('fluent-ffmpeg');
var path = require('path')
const https = require('https')
const fs = require('fs');



// AWS configuration
const AWS = require('aws-sdk');
//const { get } = require('../routes');
//AWS.config.update({region: 'ap-southeast-2'});
//AWS.config.loadFromPath('./config.json');

AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});


const dynamoClient = new AWS.DynamoDB.DocumentClient();
const dynamoName = process.env.AWS_DYNAMO_DB_QUEUE;


s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Buckets
const s3Ingest = process.env.AWS_S3_INGEST;
const s3Transcode = process.env.AWS_S3_TRANSCODE;
const qut_username = process.env.QUT_USERNAME;

const getS3UrlByDynamoID = async (dynamoID) => {
  const params = {
    TableName: dynamoName,
    Key: {
      'qut-username': qut_username,
      id: dynamoID,
    }
  }
  //return dynamoClient.get(params).promise();

  const data = await dynamoClient.get(params).promise()
  //console.log(data.Item.s3Url)
  return data.Item.s3Url
}

const updateDynamo = async (id, s3Url) => {
  const params = {
    TableName: dynamoName,
    Item: {
      'qut-username': qut_username,
      id: id,
      s3SourceUrl: s3Url
    },
  }
  return await dynamoClient.put(params).promise()
}

function downloadTmpFromS3(url) {
  console.log("downloaded from url: " + url)
  https.get(url, (res) => {
    const path = '/tmp/vid.gif'
    const filePath = fs.createWriteStream(path)
    res.pipe(filePath)
    filePath.on('finish', () => {
      filePath.close()
      console.log("downloaded vid.gif")
    })
  })

  return '/tmp/vid.gif'
}

function transcode(file) {
  var ffmpegExec = new ffmpeg(file)

  ffmpegExec.setFfmpegPath("/usr/bin/ffmpeg")
  ffmpegExec.withSize('75%').withFps(24).toFormat('matroska')
      .on('end', function () {
      console.log('file has been converted successfully');
  })
      .on('error', function (err) {
          console.log('an error happened: ' + err.message);
      })
      .saveToFile('vid6.mkv');
}



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res) {
  
  const dynamoID = req.query.dynamoID;
  if(!dynamoID) {
    res.status(400).send("No ID");
  }

  const s3Key = req.query.s3Key;
  if(!s3Key) {
    res.status(400).send("No S3 Key");
  }

  //updateDynamo(dynamoID, s3Key)
  
  getS3UrlByDynamoID(dynamoID).then((url) => {
    console.log(url)
    const sourceFilePath = downloadTmpFromS3(url);
    const transcodeFilePath = transcode(sourceFilePath);
  })

  res.status(200).send({
    dynamoID, s3Key
  })
});











module.exports = router;
