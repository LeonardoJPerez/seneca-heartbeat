process.env.AWS_XRAY_TRACING_NAME = 'payment';
process.env.AWS_XRAY_DEBUG_MODE = true;

const AWSXRay = require('aws-xray-sdk');
const _ = require('lodash');
// AWSXRay.config([AWSXRay.plugins.ElasticBeanstalkPlugin]);

const rules = {
    rules: [{
        description: 'Action handled.',
        service_name: '*',
        http_method: '*',
        url_path: '/act',
        fixed_target: 0,
        rate: 1.0
    }],
    default: {
        fixed_target: 1,
        rate: 0.1
    },
    version: 1
};

AWSXRay.middleware.setSamplingRules(rules);

let ns;

module.exports = function (subSegmentName, data) {
    ns = AWSXRay.getNamespace();
    if (!ns) {
        ns = ns.createContext();
        ns.enter(ns);
    }

    ns.run(function () {
        const parentSegment = new AWSXRay.Segment('payment', 'dr-payment', null);
        AWSXRay.setSegment(parentSegment);

        AWSXRay.captureAsyncFunc(subSegmentName, function (subsegment) {
            _.forIn(data, subsegment.addAnnotation);

            subsegment.close();
            parentSegment.close();
        });
    });
};
