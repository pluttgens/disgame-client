'use strict';

const jsonfile = require('jsonfile');
const Promise = require('bluebird');

const configPath = './config.json';
const helpPath = __dirname + '/help.json';

const config = jsonfile.readFileSync(configPath);
const helpObj = jsonfile.readFileSync(helpPath);

module.exports = function (handler) {
    handler.on('help', help);
    function help (msgHelper) {
        Promise
            .resolve(msgHelper.params)
            .then(params => params.length ? msgHelper.reply(helpObj[params[0]] ? _replaceCmd(params[0]) : 'Unknown command : ' + params[0]) : msgHelper.reply(Object.keys(help).join('\n')));
    }
    function _replaceCmd(reply) {
        return reply.replace('%cmd%', config.cmd, 'g');
    }
    return {
        help: help,
        _replaceCmd: _replaceCmd
    };
};