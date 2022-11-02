var express = require('express');
var router = express.Router();

// AWS configuration
const AWS = require('aws-sdk');
//const { get } = require('../routes');
AWS.config.update({region: 'ap-southeast-2'});
AWS.config.loadFromPath('./config.json');
s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Buckets
const s3Ingest = "n10467009-a2-ingest";
const s3Transcode = "n10467009-a2-transcode";


























/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/', function(req, res) {
  const id = req.params.id;
  if(!id) {
    res.status(400).send("No ID");
  }

  const s3Key = req.params.s3Key;
  if(!s3Key) {
    res.status(400).send("No S3 Key");
  }


  
});











module.exports = router;
