const { getSinglePendingItem } = require("./components/dynamo");
const { transcode } = require("./components/transcode");
const schedule = require('node-schedule');
const sh = require('shelljs')

async function transcodePendingItem() {

    // Get a pending items
    const singleItem = await getSinglePendingItem();
    console.log(singleItem);

    if (singleItem === undefined) {
        console.log("No pending item");
        return;
    }
    const dynamoUUID = singleItem.uuid;
    const resPercentage = "100";
    const outputFormat = !singleItem.format ? "mkv" : singleItem.format;
    // get the file and transcode it - this will cause CPU usage to spike (hopefully) and AWS will spin up a new instance to handle newer items
    downloadTmpFromS3(dynamoUUID).then((tmpFile) => {
        console.log("Downloaded file from S3 - transcoding");
        transcode(dynamoUUID, tmpFile, resPercentage, outputFormat).then(url => {
            console.log("Transcode complete - url: " + url);
        }).catch((err) => { console.log(err); });
    }).catch((err) => { console.log(err); })
        .finally(() => {
            return;
        });

}
const job = schedule.scheduleJob('*/15 * * * * *', function () {
    console.log("job starting..checking ffmpeg...");
    if (sh.exec('ps aux', { silent: true }).grep('ffmpeg').stdout != "\n") {
        console.log("ffmpeg running - skipping");
        return;
    }
    console.log("ffmpeg not running - will try to transcode new item");
    transcodePendingItem();
});
