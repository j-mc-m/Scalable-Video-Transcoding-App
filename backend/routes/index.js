// Imports
const express = require('express');
const router = express.Router();

// External functions
const { getS3KeyByDynamoUUID, getStatusByDynamoUUID } = require("./dynamo");
const { downloadTmpFromS3 } = require("./s3");
const { transcode } = require("./transcode");

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
    // Dynamo DB sort key
    const dynamoUUID = req.query.dynamoUUID;
    if(!dynamoUUID) {
        res.status(400).send("No dynamoUUID provided");
    }

    // Transcode resolution default to 100% if not specified, or if 0
    var resPercentage = req.query.resPercentage;
    if(!resPercentage || resPercentage <= "0") {
        resPercentage = "100";
    }

    var outputFormat = req.query.outputFormat;
    if(!outputFormat) { 
        outputFormat = "mkv";
    }

    const s3Key = await getS3KeyByDynamoUUID(dynamoUUID);

    try {
        const tmpFile = await new Promise((resolve, reject) => {
            resolve(downloadTmpFromS3(dynamoUUID, s3Key)).catch((err) => reject(err));
        })

        try {
            transcode(dynamoUUID, tmpFile, resPercentage, outputFormat).then(url => {
                res.status(200).send({
                s3TranscodeUrl: url
            });
        }).catch((err) => {
            console.log(err);
            res.status(400).send(err);
        });
        
        } catch(err) {
            console.log(err);
            res.status(400).send(err);
        }

    } catch(err) {
        console.log(err);
        res.status(400).send(err);
    }
});

/********
 * GET status page, unused on the backend
 */
 router.get('/status', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/********
 * POST status of current UUID
 */
router.post('/status', async function(req, res) {
    // Dynamo DB sort key
    const dynamoUUID = req.query.dynamoUUID;
    if(!dynamoUUID) {
        res.status(400).send("No dynamoUUID provided");
    }

    const status = await getStatusByDynamoUUID(dynamoUUID);

    if(status === "undefined") {
        res.status(400).send("Error retrieving status: " + status);
    } else {
        res.status(200).send({
            status: status
        });

    }
    /*
    try {
    } catch(err) {
    }*/
});

module.exports = router;