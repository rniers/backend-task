const {getProfile} = require('../middleware/getProfile');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const {bestProfession, bestClients} = require('../controllers/admin');
const {getContracts, getContractById} = require('../controllers/contracts');
const {unpaidJobs, payJob} = require('../controllers/jobs');
const {depositBalance} = require('../controllers/balances');


const router = require('express').Router();
const adminRouter = require('express').Router();
const apiRouter = require('express').Router();

adminRouter
    .get('/best-profession', bestProfession)
    .get('/best-clients', bestClients);

apiRouter
    .get('/contracts', getProfile, getContracts)
    .get('/contracts/:contractId', getProfile, getContractById)
    .get('/jobs/unpaid', getProfile, unpaidJobs)
    .post('/jobs/:jobId/pay', getProfile, payJob)
    .post('/balances/deposit/:userId', depositBalance);

const swaggerDocument = YAML.load('./docs/openapi.yaml');

router
    .use(apiRouter)
    .use('/admin', adminRouter)
    .use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


module.exports = router;
