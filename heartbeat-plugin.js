const internal$ = require('./lib');

let seneca$;
const STATS_INTERVAL = 6000;
const defaults$ = {
    pulse: true,
    pulseInterval: STATS_INTERVAL
};

function heartbeatInward(ctx, data) {
    const boundTrace = internal$.trace.bind(seneca$, ctx, data, 'handles');
    boundTrace();
}

function heartbeatOutward(ctx, data) {
    const boundTrace = internal$.trace.bind(seneca$, ctx, data, 'emits');
    boundTrace();
}

module.exports = function heartbeatPlugin(options = defaults$) {
    seneca$ = this;
    const opts = seneca$.util.deepextend(defaults$, options);

    seneca$.inward(heartbeatInward);
    seneca$.outward(heartbeatOutward);

    seneca$.add({ role: 'heartbeat', cmd: 'get' }, internal$.get);
    seneca$.add({ role: 'heartbeat', cmd: 'manifest' }, internal$.getManifest);
    seneca$.add({ role: 'heartbeat', cmd: 'serviceName' }, internal$.getServiceName);
    seneca$.add({ role: 'heartbeat', cmd: 'stats' }, internal$.getStats);
    seneca$.add({ role: 'heartbeat', cmd: 'version' }, internal$.getVersion);

    internal$.init.call(seneca$, opts);
};
