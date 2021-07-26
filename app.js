const express = require('express');
const winston = require('winston');

const app = express();

require('./startup/appManager')(app);

const port = process.env.PORT || 2222;
const server = app.listen(port, () => winston.info(`listening at port ${ port }...`))
module.exports = server;