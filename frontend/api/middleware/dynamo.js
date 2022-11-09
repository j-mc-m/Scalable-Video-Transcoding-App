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
 * Add into the Dynamo DB table
 */
const addToDynamo = async (dynamoUUID, s3Key, status, format) => {
    const params = {
        TableName: dynamoName,
        Item: {
            'qut-username': qut_username,
            uuid: dynamoUUID,
            s3Key: s3Key,
            status: status,
            format: format
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
    return data.Item;
}

module.exports = { addToDynamo, getStatusByDynamoUUID };