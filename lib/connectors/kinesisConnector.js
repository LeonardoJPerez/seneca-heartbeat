
const AWS = require('aws-sdk');
const producer = require('./kinesisProducer');

const STREAM_NAME = 'drteststream';
const REGION_NAME = 'us-east-1';

const config = {
    kinesis: {
        region: REGION_NAME
    },

    producer: {
        stream: STREAM_NAME,
        shards: 2,
        waitBetweenDescribeCallsInSeconds: 5
    }
};

const kinesis = new AWS.Kinesis({
    region: config.kinesis.region
});

module.exports = {
    producer: producer(kinesis, config.producer)
};
