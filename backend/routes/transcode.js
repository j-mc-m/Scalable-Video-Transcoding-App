var express = require('express');
var router = express.Router();
var ffmpeg = require('fluent-ffmpeg');
var fileUpload = require('express-fileupload')
var path = require('path')

var redis = require('redis')

const client = redis.createClient({
    socket: {
            host: "127.0.0.1",
            port: 6379,
    },
    password: ''
});

client.connect().catch(err => {
    console.log(err)
})

console.log("connected")

//client.setEx("test", 3600, "This is a test");

router.use(fileUpload())

router.post("/", (req, res) => {
    if(!req.files) {
        return res.status(400).send("No files sent")
    }

    const file = req.files.video
    console.log(file.name)
    console.log(file.md5)
    console.log(file.data.buffer)
    console.log(file.mimetype)
    file.mv(__dirname + '\\tmp\\' + file.name, (err) => {
        if(err) {
            return res.status(500).send(err)
        }
        transcodeFile('./tmp/' + file.name)

    })

    //const path = __dirname + "/tmp/" + file.name
})







const crypto = require('crypto')
//const path = require('path')

// AWS configuration
const AWS = require('aws-sdk');
//const { get } = require('../routes');
AWS.config.update({region: 'ap-southeast-2'});
AWS.config.loadFromPath('./config.json');
s3 = new AWS.S3({apiVersion: '2006-03-01'})

// Bucket and object names
const s3Bucket = "n10467009-a2-s3";

//import {path} from "path";
//import {fs} from "fs";
const fs = require('fs');


function transcodeFile(file) {
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

function pushToRedis(file) {
    fs.readFile(file, 'utf-8', function(err, data) {
        if(err) {
            console.log(err)
        } 
        else {
            client.setEx(path.basename(file), 3600, data.toString());
        }
    })
}

function getFromRedis(file) {
    console.log(file)
    client.get(path.basename(file), async (err, data) => {
        console.log("test")

        if(data) {
            console.log("test")

            //fs.writeFile('C:\\Users\\jack\\Downloads\\test.gif', data)
            console.log(data)       
        }
        else {

        }
    })
}

function pushToS3(file) {
    //const fileStream = fs.createReadStream(file)

    fs.readFile(file, 'utf-8', function(err, data) {
        if(err) {
            console.log(err)
        } 
        else {

        }
    })

    /*
    const uploadParams = {
        Bucket: s3Bucket,
        Key: path.basename(file),
        Body: fileStream,
    };
    */
    //console.log(uploadParams)

    /*
    s3.putObject(uploadParams, function(err, data) {
        if(err) {
            console.log(err.message)
        } else {
            console.log("success")   
        }
    })
*/






    /*
    var s3Object = '1'
    s3.getObject({Bucket: s3Bucket, Key: s3Object}, (err, result) => {
        if(result) {
            const resultJSON = JSON.parse(result.Body)
            const newResultJSON = resultJSON
            newResultJSON.count++
            const body = JSON.stringify(newResultJSON)

            // Update S3 object
            s3.putObject({Bucket: s3Bucket, Key: s3Object, Body: body}, function(err, data) {
                if(err) {
                    console.log(err.message)
                } else {
                    
                }
            })
        }
    })
    */
    
}

//pushToRedis('vid.gif');
//getFromRedis('vid.gif');
//pushToS3('app.js');

/*
console.log("asdf")
client.get('vid.gif', async (err, data) => {
    console.log("test")

    if(data) {
        console.log("test")

        //fs.writeFile('C:\\Users\\jack\\Downloads\\test.gif', data)
        console.log(data)       
    }
    else {

    }
})*/



module.exports = router;
