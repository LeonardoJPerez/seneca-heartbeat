const _ = require('lodash');
const Promise = require('bluebird');
const gitConnector = require('./connectors/gitConnector');
const xRayTrace = require('./connectors/xRayConnector');

const parentPath = `${process.cwd()}/package.json`;
const parentPackageJson = require(parentPath); // eslint-disable-line import/no-dynamic-require

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
        const version = parentPackageJson.version;

        if (_.isEmpty(version)
            && _.has(parentPackageJson.devDependencies, 'semantic-release')) {
            gitConnector
                .getReleaseVersion()
                .then((v) => {
                    done(null, { v });
                }).catch((err) => {
                    done(err);
                });

            return;
        }

        done(null, { version });
    },

    init(options) {
        const seneca = this;

        // Setting env vars.

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

        // Registering interval for collection.
        // setInterval(() => {
        // seneca.act({
        //     role: 'heartbeat',
        //     cmd: 'send'
        // });
        // }, options.pulseInterval);
    },

    trace(ctx, data, direction) {
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

        this.act({
            role: 'heartbeat',
            cmd: 'get'
        }, (err, out) => {
            if (err) {
                throw err;
            }

            xRayTrace('test', _.extend({}, out, msg));
        });
    }
};
