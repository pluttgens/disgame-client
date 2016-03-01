'use strict';

module.exports = function (bot) {
    const express = require('express');
    const bodyParser = require('body-parser');
    const morgan = require('morgan');
    const http = require('http');

    const app = express();
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.server = http.createServer(app);

    app.locals.config = __dirname + '/config.json';
    app.use('/github', require('./routes/github')(bot));

    app.listen(process.env.PORT || 2103);
};