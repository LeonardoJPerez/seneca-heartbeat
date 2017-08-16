process.env.AWS_XRAY_DEBUG_MODE = true;
process.env.AWS_XRAY_CONTEXT_MISSING = 'LOG_ERROR';

const _ = require('lodash');
const createNamespace = require('continuation-local-storage').createNamespace;
const AWSXRay = require('aws-xray-sdk');

AWSXRay.config([AWSXRay.plugins.ElasticBeanstalkPlugin]);
AWSXRay.enableManualMode();

const samplingRules = require('./samplingRules');

let ns; // Namespace used by XRay to store segments/subsegments.
let parentSegment;

module.exports = function (serviceName) {
    parentSegment = new AWSXRay.Segment(process.env.AWS_XRAY_TRACING_NAME || serviceName);

    AWSXRay.middleware.setSamplingRules(samplingRules);

    return function (subSegmentName, data) {
        ns = AWSXRay.getNamespace();
        if (!ns) {
            ns = createNamespace('AWSXRay');
            ns.enter(ns);
        }

        ns.run(function () {
            AWSXRay.captureAsyncFunc(subSegmentName, function (subsegment) {
                _.forOwn(data, (v, k) => {
                    if (_.isObject(v) || _.isArray(v) || _.isEmpty(v)) {
                        subsegment.addAnnotation(k, JSON.stringify(v) || '');
                    } else {
                        subsegment.addAnnotation(k, v);
                    }
                });

                subsegment.close();
                parentSegment.close();
            }, parentSegment);
        });
    };
};
