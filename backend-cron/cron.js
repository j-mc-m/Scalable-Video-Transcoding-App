const { getSinglePendingItem } = require("./components/dynamo");
const { transcode } = require("./components/transcode");

async function transcodePendingItems() {
    while (true) {
        // Get all pending items
        const singleItem = await getSinglePendingItem();
        console.log(singleItem);

        if (singleItem === undefined) {
            console.log("No pending items - waiting 30 seconds");
            await new Promise(resolve => setTimeout(resolve, 30000));
            continue;
        }
        const dynamoUUID = singleItem.uuid;
        const resPercentage = "100";
        const outputFormat = !singleItem.format ? "mkv" : singleItem.format;
        // get the file and transcode it - this will cause CPU usage to spike (hopefully) and AWS will spin up a new instance to handle newer items
        try {
            const tmpFile = await new Promise((resolve, reject) => {
                resolve(downloadTmpFromS3(dynamoUUID)).catch((err) => reject(err));
            });
            console.log("Downloaded file from S3 - transcoding");
            transcode(dynamoUUID, tmpFile, resPercentage, outputFormat).then(url => {
                //res.status(200).send({ s3TranscodeUrl: url });
                console.log("Transcode complete - url: " + s3TranscodeUrl);
            })
                .catch((err) => { console.log(err); });
        }
        catch (err) { console.log(err); }

        await new Promise(resolve => setTimeout(resolve, 10000));

    }
}

transcodePendingItems();
