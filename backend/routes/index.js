var express = require('express');
var router = express.Router();
require('dotenv').config();
var ffmpeg = require('fluent-ffmpeg');
const fs = require('fs').promises;
//const md5 = require("md5");
var path = require('path')


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


const getS3KeyFromDynamo = async (dynamoID) => {
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
  return data.Item.s3Key
}

const getS3SourceUrlByDynamoID = async (dynamoID) => {
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
  return data.Item.s3SourceUrl
}

const updateDynamo = async (id, status, s3TranscodeUrl) => {
  const params = {
    TableName: dynamoName,
    Item: {
      'qut-username': qut_username,
      id: id,
      status: status,
      s3TranscodeUrl: s3TranscodeUrl
    },
  }
  return await dynamoClient.put(params).promise()
}




downloadTmpFromS3 = async (s3Key) => {
  const params = {
    Bucket: s3Ingest,
    Key: s3Key,
  }

  const { Body } = await s3.getObject(params).promise()

  const location = '/tmp/' + s3Key
  await fs.writeFile(location, Body)
  return location
}

async function getData(s3Key) {
  const params = {
    Bucket: s3Ingest,
    Key: s3Key,
  }
  return await s3.getObject(params)
}

/*
const downloadTmpFromS3 = async(s3Key) => {
  return new Promise((resolve, reject) => {
    
  

    getData.then((data) => {
      const location = '/tmp/' + s3Key
      fs.writeFile(location, data)
      resolve(location)
    })
  
  })
}*/




async function uploadTranscodeToS3(file) {
  console.log("uploading " + file + " to s3 transcode bucket")
  /*
  const fileData =  fs.readFile(file)
  const fileDataBuffer = Buffer.from(fileData.data, 'binary')
  const fileKey = path.basename(file)
  */

  const fileData = await fs.readFile(file)

  const params = {
    Bucket: s3Transcode,
    Key: path.basename(file),
    Body: fileData,
  } 

  console.log(params)
    
  await s3.upload(params, function(err, result) {
    if(err) {
      console.log(err)
    } else {
      console.log("successfully uploaded to public s3 transcode: " + result.Location)
    }
  })  

}


async function transcode(file, s3Key) {
  const newFile = '/tmp/' + s3Key + '.mkv'
  console.log("ffmpeg file path: " + file)
  var ffmpegExec = await new ffmpeg(file)

  ffmpegExec.setFfmpegPath("/usr/bin/ffmpeg")
  await ffmpegExec.withSize('75%').withFps(24).toFormat('matroska')
    .on('end', function () {
      console.log('file has been converted successfully');
      uploadTranscodeToS3(newFile)
    })
    .on('error', function (err) {
        console.log('an error happened: ' + err.message);
    })
    .saveToFile(newFile)
  //return '/tmp/' + s3Key + '.mkv'
  //await uploadTranscodeToS3(newFile)
}



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// We send a POST with the DynamoDB secondary key ID.
// Download from S3 Ingest with that id to /tmp/$id.*
// Update status in DynamoDB to pending transcode
// Transcode to mkv with reduced file size
// Upload to S3 Transcode
// Get link to S3 Transcode file
// Append S3 Transcode Link and set status to completed
router.post('/', async function(req, res) {
  const dynamoID = req.query.dynamoID;
  if(!dynamoID) {
    res.status(400).send("No ID");
  }

  /*
  getS3UrlByDynamoID(dynamoID).then((url) => {
    console.log(url)
  
    const sourceFilePath = downloadTmpFromS3(url);
    const transcodeFilePath = transcode(sourceFilePath);
    console.log(transcodeFilePath)
  })*/
  //const s3SourceURL = getS3SourceUrlByDynamoID(dynamoID)

  try {
    const tmpFile = await new Promise((resolve, reject) => {
      resolve(downloadTmpFromS3(req.query.s3Key)).catch((err) => reject(err))
    })

    try {
      await new Promise((resolve, reject) => {
        resolve(transcode(tmpFile, req.query.s3Key)).catch((err) => reject(err))
      })/*.then((newFile) => {
        uploadTranscodeToS3(newFile)
      })*/
      //console.log("new file: " + newFile)


    } catch(err) {
      console.log(err)
    }



  } catch(err) {
    console.log(err)
  }

  //getS3KeyFromDynamo(dynamoID).then((s3Key) => {
    //downloadTmpFromS3(s3Key).then((response) => console.log("resp: " + response))
    //console.log(tmpFile)
    //const newFile = transcode(tmpFile, s3Key)
    //console.log(newFile)
    //uploadTranscodeToS3(newFile)
    
  

  res.status(200).send({
    dynamoID
  })
});











module.exports = router;
