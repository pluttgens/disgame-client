'use strict';

const request = require('request');

const jsonfile = require('./config').jsonfile;

const configPath = './config.json';

const config = jsonfile.readFileSync(configPath);

var _isConstructed = false;
var _handler;

module.exports = {
    construct: (handler) => {
        if (_isConstructed) {
            throw new Error('Context helper already constructed');
        }

        _handler = handler;
        _isConstructed = true;
    },
    get: (user) => {
        let context = _handler.contexts[user];

        if (!context) {
            context = _handler.contexts[user] = {};
        }

        return context;
    }
}