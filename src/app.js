const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes');


const app = express();

app.use(bodyParser.json());

const {sequelize} = require('./models')('./database.sqlite3');

app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use(router);

module.exports = app;
