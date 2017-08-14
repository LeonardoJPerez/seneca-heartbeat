const util = require('util');
const logger = require('./logger');

const LOGGER_NAME = 'heartbeatProducer';

module.exports = function sampleProducer(kinesis, config) {
    const log = logger().getLogger(LOGGER_NAME);
    const params = {
        ShardCount: config.shards,
        StreamName: config.stream
    };

    const wait = (cb) => {
        kinesis.describeStream({ StreamName: config.stream }, (err, data) => {
            if (err) {
                log.error(util.format('Error awaiting for to become active stream: %s', err));
                cb(err);
                return;
            }

            log.info(util.format('Current status of the stream is %s.', data.StreamDescription.StreamStatus));

            if (data.StreamDescription.StreamStatus === 'ACTIVE') {
                cb(null);
                return;
            }

            setTimeout(() => {
                wait(cb);
            }, 1000 * config.waitBetweenDescribeCallsInSeconds);
        });
    };

    return {
        execute(data) {
            // Creating stream
            kinesis.createStream(params, (err) => {
                if (err) {
                    if (err.code !== 'ResourceInUseException') {
                        log.error(util.format('Error creating stream: %s', err));
                        return;
                    }

                    log.info(util.format('%s stream is already created. Re-using it.', config.stream));
                }

                log.info(util.format("%s stream doesn't exist. Created a new stream with that name ..", config.stream));

                // Poll to make sure stream is in ACTIVE state before start pushing data.
                wait(function onStreamReady(err2) {
                    if (err2) {
                        log.error(err2);
                    }

                    const record = {
                        Data: JSON.stringify(data),
                        PartitionKey: data.sensor,
                        StreamName: config.stream
                    };

                    kinesis.putRecord(record, (err3, d) => {
                        if (err3) {
                            log.error(err3);
                        }

                        log.info('Successfully sent data to Kinesis.');
                        log.info(d);
                    });
                });
            });
        }
    };
};
