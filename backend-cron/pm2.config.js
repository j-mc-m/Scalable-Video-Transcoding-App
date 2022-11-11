module.exports = {
    apps: [{
        name: 'CAB432 Backend',
        script: 'cron.js',
        autorestart: true,
        env_production: {
            NODE_ENV: "production",
            AWS_DEFAULT_REGION: "ap-southeast-2",
            AWS_S3_INGEST: "n7439954-a2-ingest",
            AWS_DYNAMO_DB_QUEUE: "n7439954-a2-queue",
            QUT_USERNAME: "n7439954@qut.edu.au",
            AWS_S3_TRANSCODE: "n7439954-a2-output"
        },
    }]
};