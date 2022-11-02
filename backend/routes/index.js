var express = require('express');
var router = express.Router();
require('dotenv').config();

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

const getByDynamoID = async (dynamoID) => {
  const params = {
    TableName: dynamoName,
    Key: {
      dynamoID,
    }
  }
  return await dynamoClient.get(params).promise();
}

const updateDynamo = async (id, s3Url) => {
  const params = {
    TableName: dynamoName,
    Item: {
      'qut-username': "n10467009@qut.edu.au",
      id: id,
      s3Url: s3Url
    },
  }

  console.log(params)
  return await dynamoClient.put(params).promise()
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

  updateDynamo(dynamoID, s3Key)

  res.status(200).send({
    dynamoID, s3Key
  })
});











module.exports = router;
