// Imports
require('dotenv').config();

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

/********
 * Returns the S3 Key from the Dynamo DB status table
 */
 const getS3KeyByDynamoUUID = async (dynamoUUID) => {
    const params = {
        TableName: dynamoName,
        Key: {
            'qut-username': qut_username,
            uuid: dynamoUUID,
        }
    }
  
    const data = await dynamoClient.get(params).promise();
    return data.Item.s3Key;
}

/********
 * Update the Dynamo DB table status and/or add the transcoded URL
 */
 const updateDynamo = async (dynamoUUID, status, s3TranscodeUrl) => {
    const s3Key = await getS3KeyByDynamoUUID(dynamoUUID);
    const params = {
        TableName: dynamoName,
        Item: {
            'qut-username': qut_username,
            uuid: dynamoUUID,
            s3Key: s3Key,
            status: status,
            s3TranscodeUrl: s3TranscodeUrl
        },
    }
  
    return await dynamoClient.put(params).promise();
}

/********
 * Returns the S3 Key from the Dynamo DB status table
 */
 const getStatusByDynamoUUID = async (dynamoUUID) => {
    const params = {
        TableName: dynamoName,
        Key: {
            'qut-username': qut_username,
            uuid: dynamoUUID,
        }
    }
  
    const data = await dynamoClient.get(params).promise();
    return data.Item.status;
}

module.exports = { getS3KeyByDynamoUUID, updateDynamo, getStatusByDynamoUUID };