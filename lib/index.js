const _ = require('lodash');
const Promise = require('bluebird');

const parentPath = `${process.cwd()}/package.json`;
const parentPackageJson = require(parentPath); // eslint-disable-line import/no-dynamic-require

const xRayTrace = require('./connectors/xRayConnector')(parentPackageJson.name);

const manifest$ = { emits: [], handles: [] };

const isInternalAction = (obj) => {
    return obj.role === 'seneca' ||
        obj.role === 'transport' ||
        obj.role === 'options' ||
        obj.role === 'mesh' ||
        obj.role === 'heartbeat' ||
        _.isEmpty(obj.cmd) ||
        obj.init;
};

module.exports = {
    get(msg, done) {
        const act = Promise.promisify(this.act, { context: this });

        Promise.all([
            act({
                role: 'heartbeat',
                cmd: 'version'
            }),
            act({
                role: 'heartbeat',
                cmd: 'serviceName'
            }),
            act({
                role: 'heartbeat',
                cmd: 'stats'
            })
        ]).then((result) => {
            const response = {};
            _.forEach(result, (v) => {
                _.extend(response, v);
            });

            done(null, response);
        }).catch((err) => {
            done(err);
        });
    },

    getManifest(msg, done) {
        done({ manifest: manifest$ });
    },

    getServiceName(msg, done) {
        done({ name: parentPackageJson.name });
    },

    getStats(msg, done) {
        done({ stats: this.stats() });
    },

    getVersion(msg, done) {
        done(null, { version: parentPackageJson.version });
    },

    init(options) {
        const seneca = this;

        _.forEach(seneca.list(), (e) => {
            if (!isInternalAction(e)) {
                let pin = JSON.stringify(e);
                pin = pin.replace(/['"]+/g, '').replace('{', '').replace('}', '');

                const plugin = seneca.find(pin);
                if (plugin.client) { return; }

                manifest$.handles.push(_.extend({}, { pin, count: 0 }, e));
            }
        });

        if (!options.pulse) { return; }
    },

    trace(ctx, data, direction) {
        const seneca = this;

        if (isInternalAction(data.msg)) {
            return;
        }

        const msg = data.msg;
        const isServer = msg.transport$ && msg.meta$.plugin_name !== 'client$';

        if (isServer || direction === 'emits') {
            // const service = ctx.seneca.options().tag;
            const pin = msg.meta$.pattern;
            const pinCollection = manifest$[direction];

            const pinIndex = _.findIndex(pinCollection, p => p.pin === pin);

            if (pinIndex !== -1) {
                pinCollection[pinIndex].count += 1;
            } else {
                const jsonPin = ctx.seneca.util.parsepattern(ctx.seneca, [msg.meta$.pattern]).pattern;
                pinCollection.push(_.extend({ pin, count: 1 }, jsonPin));
            }
        }

        seneca.act({
            role: 'heartbeat',
            cmd: 'get'
        }, (err, out) => {
            if (err) {
                throw err;
            }

            const cleanData = seneca.util.clean(msg);
            xRayTrace('test', _.extend({}, out, cleanData));
        });
    }
};
