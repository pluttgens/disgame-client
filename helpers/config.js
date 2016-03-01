'use strict';


module.exports = function () {

////////////////////////////////////////////////////////////////

    // JSONFILE

    const jsonfile = require('jsonfile');

    jsonfile.spaces = 4;

    const configPath = '../config.json';

    const config = require(configPath);

    // WINSTON

    const winston = require('winston');

    if (process.env.ENV !== 'PROD') {
        winston.level = 'debug';
        winston.add(winston.transports.File, {
            level: config.env,
            filename: 'logs.json',
            maxsize: 2048 * 48,
            prettyPrint: true
        });
    } else {
        winston.level = 'info';
    }

    let apiKey;
    let secret;
    try {
        let auth = require('../auth.js');
        apiKey = auth.apiKey;
        secret = auth.secret;
    } catch (e) {
        apiKey = process.env.API_KEY || config.auth.apiKey;
        secret = process.env.SECRET || config.auth.secret;
    }

    require('disgame-api')
        .connect(apiKey, secret)
        .then(() => {
            winston.info('Successfully connected to API Server');
        });
};