'use strict';

const jsonfile = require('jsonfile');

const configPath = './config.json';
const helpPath = __dirname + '/help.json';

const config = jsonfile.readFileSync(configPath);
const help = jsonfile.readFileSync(helpPath);

module.exports = function (handler) {

    handler.on('help', function (msgHelper) {
        if (msgHelper.params.length === 0) {
            return msgHelper.reply(Object.keys(help).join('\n'));
        }

        var reply = help[msgHelper.params[0]];

        return msgHelper.reply(reply ? replaceCmd(reply) : 'Unknown command : ' + msgHelper.params[0]);

        function replaceCmd(reply) {
            return reply.replace('%cmd%', config.cmd)
        }
    });


};