'use strict';

const async = require('async');

const jsonfile = require('../../helpers/config').jsonfile;
const winston = require('../../helpers/config').winston;

const configPath = './config.json';
const helpPath = __dirname + '/help.json';

const config = jsonfile.readFileSync(configPath);
const help = jsonfile.readFileSync(helpPath);

module.exports = function (handler) {

    handler.on('help', function (msgHelper) {
        if (msgHelper.getParams().length === 1) {
            return msgHelper.reply(Object.keys(help).join('\n'));
        }

        var reply = help[msgHelper.getParams()[0]];

        return msgHelper.reply(reply ? replaceCmd(reply) : 'Unknown command : ' + msgHelper.getParams()[0]);

        function replaceCmd(reply) {
            return reply.replace('%cmd%', config.cmd)
        }
    });


};