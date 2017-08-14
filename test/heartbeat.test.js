// const Seneca = require('seneca');
// const chai = require('chai'); // assertion library
// const mocha = require('mocha');

// const extend = require('lodash/extend');
// const hasProperty = require('lodash/has');

// const describe = mocha.describe;
// const it = mocha.it;
// const assert = chai.assert;

// const initSeneca = (done) => {
//     return Seneca({ log: 'test' })
//         .test(done)
//         .use(require('../lib/index')); // eslint-disable-line global-require
// };


// const paymentGetWithTaxesPattern = {
//     role: 'payment',
//     cmd: 'get',
//     includeTaxes: true
// };


// describe('Payment Service', () => {
//     const validPdGatewayOutputFinance = [
//         { term: 36, monthlyPayment: 2000, FakeData: 'Hello' },
//         { term: 72, monthlyPayment: 3000, FakeData: 'Hola' },
//         { term: 36, monthlyPayment: 1000, FakeData: 'Ni Hao' },
//         { term: 48, monthlyPayment: 1000, FakeData: 'Aloha' },
//         { term: 48, monthlyPayment: 2000, FakeData: 'Bonjour' }
//     ];

//     const validPdGatewayOutputLease = [
//         { term: 36, monthlyPayment: 2000, FakeData: 'Goodbye' },
//         { term: 72, monthlyPayment: 3000, FakeData: 'Adios' },
//         { term: 36, monthlyPayment: 1000, FakeData: 'A Bientot' },
//         { term: 48, monthlyPayment: 1000, FakeData: 'Toodles' },
//         { term: 48, monthlyPayment: 2000, FakeData: 'A Dieu' }
//     ];

//     const expectedValidFinance = [
//         { term: 36, monthlyPayment: 1000, FakeData: 'Ni Hao' },
//         { term: 48, monthlyPayment: 1000, FakeData: 'Aloha' },
//         { term: 72, monthlyPayment: 3000, FakeData: 'Hola' }
//     ];

//     const expectedValidLease = [
//         { term: 36, monthlyPayment: 1000, FakeData: 'A Bientot' },
//         { term: 48, monthlyPayment: 1000, FakeData: 'Toodles' },
//         { term: 72, monthlyPayment: 3000, FakeData: 'Adios' }
//     ];

//     const pdEmptyResult = {
//         finance: [],
//         lease: []
//     };

//     describe('Calculate', () => {
//         it('should return valid data when given a valid response', (finish) => {
//             const gatewayOutput = {
//                 finance: validPdGatewayOutputFinance,
//                 lease: validPdGatewayOutputLease
//             };

//             const seneca = initSeneca(finish);
//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => {
//                 return done(gatewayOutput);
//             });

//             seneca.act(validPaymentCalculateInput, (err, out) => {
//                 assert.isNull(err);
//                 assert.isTrue(out.ok);
//                 assert.deepEqual(out.finance, expectedValidFinance);
//                 assert.deepEqual(out.lease, expectedValidLease);

//                 finish();
//             });
//         });

//         it('should return valid data when given a response with some invalid data', (finish) => {
//             const pdGatewayOutputFinanceSomeInvalid = validPdGatewayOutputFinance;
//             pdGatewayOutputFinanceSomeInvalid.push({ yeah: 'yeah, they are here' });
//             const pdGatewayOutputLeaseSomeInvalid = validPdGatewayOutputLease;
//             pdGatewayOutputLeaseSomeInvalid.push({ no: 'problem at all' });
//             const gatewayOutput = {
//                 finance: pdGatewayOutputFinanceSomeInvalid,
//                 lease: pdGatewayOutputLeaseSomeInvalid
//             };

//             const expected = {
//                 finance: expectedValidFinance,
//                 lease: expectedValidLease
//             };

//             const seneca = initSeneca(finish);
//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => { return done(gatewayOutput); });

//             seneca.act(validPaymentCalculateInput, (err, out) => {
//                 assert.isNull(err);
//                 assert.isTrue(out.ok);
//                 assert.deepEqual(out.finance, expected.finance);
//                 assert.deepEqual(out.lease, expected.lease);

//                 finish();
//             });
//         });

//         it('should return valid data when given a response only has finance options', (finish) => {
//             const expected = {
//                 finance: expectedValidFinance,
//                 lease: []
//             };

//             const seneca = initSeneca(finish);
//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => {
//                 done({ finance: validPdGatewayOutputFinance, lease: [] });
//             });

//             seneca.act(validPaymentCalculateInput, (err, out) => {
//                 assert.isNull(err);
//                 assert.isTrue(out.ok);
//                 assert.deepEqual(out.finance, expected.finance);
//                 assert.deepEqual(out.lease, expected.lease);

//                 finish();
//             });
//         });

//         it('should return valid data when given a response only has lease options', (finish) => {
//             const expected = {
//                 finance: [],
//                 lease: expectedValidLease
//             };

//             const seneca = initSeneca(finish);
//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => {
//                 done({ finance: [], lease: validPdGatewayOutputLease });
//             });

//             seneca.act(validPaymentCalculateInput, (err, out) => {
//                 assert.isNull(err);
//                 assert.isTrue(out.ok);
//                 assert.deepEqual(out.finance, expected.finance);
//                 assert.deepEqual(out.lease, expected.lease);

//                 finish();
//             });
//         });

//         it('should return the empty finance and lease objects when no payments found', (finish) => {
//             const seneca = initSeneca(finish);
//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => { return done(pdEmptyResult); });

//             seneca.act(validPaymentCalculateInput, (err, out) => {
//                 assert.isNull(err);
//                 assert.isTrue(out.ok);
//                 assert.isArray(out.finance);
//                 assert.lengthOf(out.finance, 0);
//                 assert.isArray(out.lease);
//                 assert.lengthOf(out.lease, 0);

//                 finish();
//             });
//         });
//     });

//     describe('Get', () => {
//         it('should return empty results when given PD Gateway returns blank an empty result (no payment options found)', (finish) => {
//             const seneca = initSeneca(finish);
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done(mockVehicleGetData.mockVehicleGetResponse());
//             });

//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => {
//                 done(pdEmptyResult);
//             });

//             seneca.act(validPaymentGetInput, (err, result) => {
//                 assert.isNull(err);
//                 assert.deepEqual(result, {
//                     ok: true,
//                     finance: { payments: [] },
//                     lease: { payments: [] }
//                 });

//                 finish();
//             });
//         });

//         it('should return payment results when given PD Gateway returns valid result', (finish) => {
//             const seneca = initSeneca(finish);
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done(mockVehicleGetData.mockVehicleGetResponseWithIncentives());
//             });

//             const pdGatewayGetPaymentsResponse = {
//                 lease: validPdGatewayOutputLeaseDealSummary,
//                 finance: validPdGatewayOutputFinanceDealSummary
//             };

//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => {
//                 done(pdGatewayGetPaymentsResponse);
//             });

//             seneca.act(validPaymentGetInput, (err, results) => {
//                 const result = results;
//                 assert.isNull(err);
//                 assert.deepEqual(result, expectedPaymentGetValidWithDealSummary);

//                 finish();
//             });
//         });

//         it('should return payment incentives when include incentives is set to true', (finish) => {
//             const seneca = initSeneca(finish);
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done(mockVehicleGetData.mockVehicleGetResponseWithIncentives());
//             });

//             const pdGatewayGetPaymentsResponse = {
//                 lease: validPdGatewayOutputLease,
//                 finance: validPdGatewayOutputFinance
//             };

//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => {
//                 done(pdGatewayGetPaymentsResponse);
//             });

//             seneca.act(validPaymentGetInputWithIncentives(), (err, result) => {
//                 const incentives = mockVehicleGetData.mockVehicleGetResponseWithIncentives().incentives;

//                 assert.isNull(err);
//                 assert.isTrue(result.ok);
//                 assert.strictEqual(result.finance.incentives.nonConditional.length, 1);
//                 assert.strictEqual(result.finance.incentives.conditional.length, 2);
//                 assert.strictEqual(result.lease.incentives.nonConditional.length, 4);
//                 assert.strictEqual(result.lease.incentives.conditional.length, 1);
//                 assert.deepInclude(result.finance.incentives.conditional, incentives[0]);
//                 assert.deepInclude(result.finance.incentives.nonConditional, incentives[1]);
//                 assert.deepInclude(result.lease.incentives.nonConditional, incentives[1]);
//                 assert.deepInclude(result.lease.incentives.conditional, incentives[3]);
//                 assert.deepInclude(result.lease.incentives.nonConditional, incentives[4]);
//                 assert.deepInclude(result.finance.incentives.conditional, incentives[5]);
//                 assert.deepInclude(result.lease.incentives.nonConditional, incentives[6]);
//                 assert.deepInclude(result.lease.incentives.nonConditional, incentives[7]);

//                 finish();
//             });
//         });

//         it('should call payment calculate with conditional incentives if passed', (finish) => {
//             const seneca = initSeneca(finish);
//             const gatewayOutput = {
//                 finance: validPdGatewayOutputFinance,
//                 lease: validPdGatewayOutputLease
//             };
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done({
//                     ok: true,
//                     incentives: [],
//                     vehicle: {
//                         info: {}
//                     }
//                 });
//             });
//             let messageSentToPaymentCalculate;
//             seneca.use(() => {
//                 seneca.add(paymentCalculatePattern, (msg, done) => {
//                     messageSentToPaymentCalculate = msg;
//                     return done(gatewayOutput);
//                 });
//                 return {
//                     name: 'mock_payment_calculate'
//                 };
//             });
//             seneca.act(validPaymentGetInputWithIncentives(), (err, result) => {
//                 assert.isNull(err);
//                 assert.isNotNull(result);
//                 assert.deepEqual(messageSentToPaymentCalculate.finance.incentives.conditional,
//                     validPaymentGetInputWithIncentives().finance.incentives.conditional);
//                 finish();
//             });
//         });

//         it('should call payment calculate with nonconditional incentives from vehicle', (finish) => {
//             const seneca = initSeneca(finish);
//             const gatewayOutput = {
//                 finance: validPdGatewayOutputFinance,
//                 lease: validPdGatewayOutputLease
//             };
//             const expectedResults = {
//                 finance: {
//                     nonConditional: [1]
//                 },
//                 lease: {
//                     nonConditional: [1, 4, 6, 7]
//                 }
//             };
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done(mockVehicleGetData.mockVehicleGetResponseWithIncentives());
//             });
//             let messageSentToPaymentCalculate;
//             seneca.use(() => {
//                 seneca.add(paymentCalculatePattern, (msg, done) => {
//                     messageSentToPaymentCalculate = msg;
//                     return done(gatewayOutput);
//                 });
//                 return {
//                     name: 'mock_payment_calculate'
//                 };
//             });
//             seneca.act(validPaymentGetInputWithIncentives(), (err, result) => {
//                 assert.isNull(err);
//                 assert.isNotNull(result);
//                 assert.deepEqual(messageSentToPaymentCalculate.finance.incentives.nonConditional, expectedResults.finance.nonConditional);
//                 assert.deepEqual(messageSentToPaymentCalculate.lease.incentives.nonConditional, expectedResults.lease.nonConditional);
//                 finish();
//             });
//         });

//         it('should return payment results when PD Gateway returns only lease options', (finish) => {
//             const seneca = initSeneca(finish);
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done(mockVehicleGetData.mockVehicleGetResponse());
//             });

//             const pdGatewayGetPaymentsResponse = {
//                 lease: validPdGatewayOutputLeaseDealSummary,
//                 finance: []
//             };

//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => {
//                 done(pdGatewayGetPaymentsResponse);
//             });

//             seneca.act(validPaymentGetInput, (err, result) => {
//                 assert.isNull(err);
//                 assert.isTrue(result.ok);
//                 assert.exists(result.finance);
//                 assert.empty(result.finance.payments);
//                 assert.deepEqual(result.lease, expectedPaymentGetValidWithDealSummary.lease);
//                 assert.notExists(result.lease.incentives);

//                 finish();
//             });
//         });

//         it('should return payment results when given PD Gateway returns only finance options', (finish) => {
//             const seneca = initSeneca(finish);
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done(mockVehicleGetData.mockVehicleGetResponse());
//             });

//             const pdGatewayGetPaymentsResponse = {
//                 lease: [],
//                 finance: validPdGatewayOutputFinanceDealSummary
//             };

//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => {
//                 done(pdGatewayGetPaymentsResponse);
//             });

//             seneca.act(validPaymentGetInput, (err, result) => {
//                 assert.isNull(err);
//                 assert.isTrue(result.ok);
//                 assert.deepEqual(result.finance, expectedPaymentGetValidWithDealSummary.finance);
//                 assert.notExists(result.finance.incentives);
//                 assert.exists(result.lease);
//                 assert.empty(result.lease.payments);

//                 finish();
//             });
//         });

//         it('should return error message from vehicle service if vehicle:get returns no results', (finish) => {
//             const seneca = initSeneca(finish);
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done({
//                     ok: true,
//                     incentives: [],
//                     vehicle: {
//                     }
//                 });
//             });

//             seneca.act(validPaymentGetInput, (err, result) => {
//                 assert.isNull(err);
//                 assert.deepEqual(result, {
//                     ok: false,
//                     why: Errors.NO_VEHICLE_FOUND
//                 });
//                 finish();
//             });
//         });

//         it('should call payment Calculate with info.odometer if msg.vehicleMileage is passed', (finish) => {
//             const seneca = initSeneca(finish);
//             const gatewayOutput = {
//                 finance: validPdGatewayOutputFinance,
//                 lease: validPdGatewayOutputLease
//             };
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done({
//                     ok: true,
//                     incentives: [],
//                     vehicle: {
//                         info: {}
//                     }
//                 });
//             });
//             let messageSentToPaymentCalculate;
//             seneca.use(() => {
//                 seneca.add(paymentCalculatePattern, (msg, done) => {
//                     messageSentToPaymentCalculate = msg;
//                     return done(gatewayOutput);
//                 });
//                 return {
//                     name: 'mock_payment_calculate'
//                 };
//             });
//             const pattern = extend({}, validPaymentGetInput, { vehicleMileage: 77 });
//             seneca.act(pattern, (err, result) => {
//                 assert.isNull(err);
//                 assert.isNotNull(result);
//                 assert.strictEqual(messageSentToPaymentCalculate.vehicle.info.odometer, 77);
//                 finish();
//             });
//         });

//         it('should call paymentCalculate with no odometer if null msg.vehicleMileage is passed', (finish) => {
//             const seneca = initSeneca(finish);
//             const gatewayOutput = {
//                 finance: validPdGatewayOutputFinance,
//                 lease: validPdGatewayOutputLease
//             };
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done({
//                     ok: true,
//                     incentives: [],
//                     vehicle: {
//                         info: {}
//                     }
//                 });
//             });
//             let messageSentToPaymentCalculate;
//             seneca.use(() => {
//                 seneca.add(paymentCalculatePattern, (msg, done) => {
//                     messageSentToPaymentCalculate = msg;
//                     return done(gatewayOutput);
//                 });
//                 return {
//                     name: 'mock_payment_calculate'
//                 };
//             });
//             const pattern = extend({}, validPaymentGetInput, { vehicleMileage: null });
//             seneca.act(pattern, (err, result) => {
//                 assert.isNull(err);
//                 assert.isNotNull(result);
//                 // TODO: find better assertion for this
//                 assert.isFalse(hasProperty(messageSentToPaymentCalculate.vehicle.info, 'odometer'));
//                 finish();
//             });
//         });

//         it('should call payment calculate with no odometer if  undefined msg.vehicleMileage is passed', (finish) => {
//             const seneca = initSeneca(finish);
//             const gatewayOutput = {
//                 finance: validPdGatewayOutputFinance,
//                 lease: validPdGatewayOutputLease
//             };
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done({
//                     ok: true,
//                     incentives: [],
//                     vehicle: {
//                         info: {}
//                     }
//                 });
//             });
//             let messageSentToPaymentCalculate;
//             seneca.use(() => {
//                 seneca.add(paymentCalculatePattern, (msg, done) => {
//                     messageSentToPaymentCalculate = msg;
//                     return done(gatewayOutput);
//                 });
//                 return {
//                     name: 'mock_payment_calculate'
//                 };
//             });
//             const pattern = extend({}, validPaymentGetInput, { vehicleMileage: undefined });
//             seneca.act(pattern, (err, result) => {
//                 assert.isNull(err);
//                 assert.isNotNull(result);
//                 // TODO: find better assertion
//                 assert.isFalse(hasProperty(messageSentToPaymentCalculate.vehicle.info, 'odometer'));
//                 finish();
//             });
//         });

//         it('should call payment calculate with no odometer if emptystring msg.vehicleMileage is passed', (finish) => {
//             const seneca = initSeneca(finish);
//             const gatewayOutput = {
//                 finance: validPdGatewayOutputFinance,
//                 lease: validPdGatewayOutputLease
//             };
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done({
//                     ok: true,
//                     incentives: [],
//                     vehicle: {
//                         info: {}
//                     }
//                 });
//             });
//             let messageSentToPaymentCalculate;
//             seneca.use(() => {
//                 seneca.add(paymentCalculatePattern, (msg, done) => {
//                     messageSentToPaymentCalculate = msg;
//                     return done(gatewayOutput);
//                 });
//                 return {
//                     name: 'mock_payment_calculate'
//                 };
//             });
//             const pattern = extend({}, validPaymentGetInput, { vehicleMileage: '' });
//             seneca.act(pattern, (err, result) => {
//                 assert.isNull(err);
//                 assert.isNotNull(result);
//                 // TODO: find better assertion
//                 assert.isFalse(hasProperty(messageSentToPaymentCalculate.vehicle.info, 'odometer'));
//                 finish();
//             });
//         });

//         it('should return error message from vehicle service if vehicle:get returns an invalid response', (finish) => {
//             const seneca = initSeneca(finish);
//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 done({
//                     ok: true,
//                     incentives: [],
//                     vehicle: '' // just a falsy value
//                 });
//             });

//             seneca.act(validPaymentGetInput, (err, result) => {
//                 assert.isNull(err);
//                 assert.deepEqual(result, {
//                     ok: false,
//                     why: Errors.INVALID_VEHICLE_RESPONSE
//                 });
//                 finish();
//             });
//         });

//         it('should return payment with taxes if taxes: true is set.', (finish) => {
//             const seneca = initSeneca(finish);

//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 return done(mockDataResponses.mockPDGetVehicleResponse());
//             });

//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => {
//                 return done(mockDataResponses.mockPDGetPaymentResponse());
//             });

//             seneca.add(pdGatewayGetQuestionsPattern, (msg, done) => {
//                 const response = mockDataResponses.mockPDGetQuestionsResponse();
//                 response.answersNeeded = true;
//                 return done(response);
//             });

//             seneca.add(pdGatewayGetPaymentPatternWithTaxesPattern, (msg, done) => {
//                 return done(mockDataResponses.mockPdGetPaymentWithTaxesResponse());
//             });

//             const getPaymentWithTaxesMessage = {
//                 profileId: 123456,
//                 zipCode: 30319,
//                 includeIncentives: false,
//                 chromeStyleId: 7897,
//                 vehicleCondition: 'New',
//                 financeType: 'finance',
//                 finance: {
//                     termList: [24, 36, 48, 60]
//                 },
//                 lease: {
//                     termList: [24, 36, 48, 60]
//                 }
//             };

//             const pattern = extend({}, paymentGetWithTaxesPattern, getPaymentWithTaxesMessage);
//             seneca.act(pattern, (err, result) => {
//                 assert.isNull(err);
//                 assert.deepEqual(result, mockDataResponses.expectedQuestionsResponse());
//                 finish();
//             });
//         });

//         it('should return payment with taxes if taxes: true is set.', (finish) => {
//             const seneca = initSeneca(finish);

//             seneca.add(vehicleGetPattern, (msg, done) => {
//                 return done(mockDataResponses.mockPDGetVehicleResponse());
//             });

//             seneca.add(pdGatewayGetPaymentsPattern, (msg, done) => {
//                 return done(mockDataResponses.mockPDGetPaymentResponse());
//             });

//             seneca.add(pdGatewayGetQuestionsPattern, (msg, done) => {
//                 const response = mockDataResponses.mockPDGetQuestionsResponse();
//                 response.answersNeeded = false;
//                 return done(response);
//             });

//             seneca.add(pdGatewayGetPaymentPatternWithTaxesPattern, (msg, done) => {
//                 return done(mockDataResponses.mockPdGetPaymentWithTaxesResponse());
//             });

//             const getPaymentWithTaxesMessage = {
//                 profileId: 123456,
//                 zipCode: 30319,
//                 includeIncentives: false,
//                 chromeStyleId: 7897,
//                 vehicleCondition: 'New',
//                 financeType: 'finance',
//                 finance: {
//                     downPayment: 1500,
//                     termList: [24, 36, 48, 60],
//                     retailPrice: 22000,
//                     listedPrice: 24000
//                 },
//                 lease: {
//                     downPayment: 1500,
//                     termList: [24, 36, 48, 60],
//                     annualMiles: 12000,
//                     retailPrice: 25000,
//                     listedPrice: 27000
//                 }
//             };

//             const expected = mockDataResponses.expectedGetPaymentWithTaxesResponsePayment();
//             expected.status = 'ShowPayments';
//             expected.finance.incentives = [];

//             const pattern = extend({}, paymentGetWithTaxesPattern, getPaymentWithTaxesMessage);
//             seneca.act(pattern, (err, result) => {
//                 assert.isNull(err);
//                 assert.deepEqual(result, expected);
//                 finish();
//             });
//         });
//     });
// });
