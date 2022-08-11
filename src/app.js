const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes');
const errorHandler = require('./middleware/errorHandler');


const app = express();

app.use(bodyParser.json());

const {sequelize} = require('./models')('./database.sqlite3');

app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use(router);
app.use(errorHandler);

module.exports = app;
