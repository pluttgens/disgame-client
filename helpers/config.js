'use strict';

////////////////////////////////////////////////////////////////

// JSONFILE

const jsonfile = require('jsonfile');

jsonfile.spaces = 4;

const configPath = './config.json';

const config = jsonfile.readFileSync(configPath);

// WINSTON

const winston = require('winston');

winston.level = 'debug';
winston.add(winston.transports.File, {
    level: config.env,
    filename: 'logs.json',
    maxsize: 2048 * 48,
    prettyPrint: true
});