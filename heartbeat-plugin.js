const kinesisConnector = require('./lib/connectors/kinesisConnector');

const internal$ = require('./lib');

const STATS_INTERVAL = 6000;
const defaults$ = {
    pulse: true,
    pulseInterval: STATS_INTERVAL
};

function heartbeatInward(ctx, data) {
    internal$.trace(ctx, data, 'handles');
}

function heartbeatOutward(ctx, data) {
    internal$.trace(ctx, data, 'emits');
}

module.exports = function heartbeatPlugin(options = defaults$) {
    const seneca = this;
    const opts = seneca.util.deepextend(defaults$, options);

    seneca.inward(heartbeatInward);
    seneca.outward(heartbeatOutward);

    seneca.add({ role: 'heartbeat', cmd: 'get' }, internal$.get);
    seneca.add({ role: 'heartbeat', cmd: 'manifest' }, internal$.getManifest);
    seneca.add({ role: 'heartbeat', cmd: 'serviceName' }, internal$.getServiceName);
    seneca.add({ role: 'heartbeat', cmd: 'stats' }, internal$.getStats);
    seneca.add({ role: 'heartbeat', cmd: 'version' }, internal$.getVersion);

    // Piping data to Kinesis.
    // Test code.
    seneca.add({ role: 'heartbeat', cmd: 'send' }, function sendStats(msg, done) {
        this.act({
            role: 'heartbeat',
            cmd: 'get'
        }, (err, out) => {
            if (err) {
                throw err;
            }

            // Add Kinesis pipe of current stats.
            console.log('Data sent to kinesis.');

            const currTime = new Date().getMilliseconds();
            const sensor = `sensor-${Math.floor(Math.random() * 100000)}`;
            const reading = Math.floor(Math.random() * 1000000);

            const record = {
                time: currTime,
                sensor,
                reading
            };

            // kinesisConnector.producer.execute(record);
            done(out);
        });
    });

    internal$.init.call(seneca, opts);
};
