'use strict';

////////////////////////////////////////////////////////////////

// WINSTON

const winston = require('winston');

winston.level = 'debug';
winston.add(winston.transports.File, {
    level: 'debug',
    filename: 'logs.json',
    maxsize: 2048,
    prettyPrint: true,
});

// JSONFILE

const jsonfile = require('jsonfile');

jsonfile.spaces = 4;


////////////////////////////////////////////////////////////////

module.exports = {
    jsonfile: jsonfile,
    winston: winston
}